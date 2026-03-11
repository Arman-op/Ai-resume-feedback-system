from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, JSON, ForeignKey, DECIMAL, Boolean, UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.sql import func
import fitz
import os
import json
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import re
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/resume_db")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    avatar_url = Column(Text)
    google_id = Column(String(255), unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(500), nullable=False)
    file_url = Column(Text, nullable=False)
    file_size = Column(Integer)
    extracted_text = Column(Text)
    ats_score = Column(Integer)
    keyword_score = Column(Integer)
    formatting_score = Column(Integer)
    impact_score = Column(Integer)
    completeness_score = Column(Integer)
    analysis_result = Column(JSON)
    job_description = Column(Text)
    target_role = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="resumes")

class Keyword(Base):
    __tablename__ = "keywords"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    keyword = Column(String(255), nullable=False)
    weight = Column(DECIMAL(3, 2), default=1.00)
    industry = Column(String(100))
    is_technical = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Feedback API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AnalysisResult(BaseModel):
    overall_feedback: str
    keyword_analysis: Dict[str, Any]
    formatting_analysis: Dict[str, Any]
    impact_analysis: Dict[str, Any]
    completeness_analysis: Dict[str, Any]
    improvement_plan: List[str]

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_url: str
    ats_score: int
    keyword_score: int
    formatting_score: int
    impact_score: int
    completeness_score: int
    analysis_result: Optional[AnalysisResult]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ScoreBreakdown(BaseModel):
    keyword_score: int
    formatting_score: int
    impact_score: int
    completeness_score: int
    overall_score: int

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting PDF text: {str(e)}")
    return text

def calculate_keyword_score(text: str, db: Session) -> tuple:
    text_lower = text.lower()
    keywords = db.query(Keyword).all()
    
    matched_keywords = []
    missing_keywords = []
    total_weight = 0
    matched_weight = 0
    
    for kw in keywords:
        total_weight += float(kw.weight)
        if kw.keyword.lower() in text_lower:
            matched_keywords.append(kw.keyword)
            matched_weight += float(kw.weight)
        else:
            missing_keywords.append(kw.keyword)
    
    score = int((matched_weight / total_weight) * 100) if total_weight > 0 else 0
    return score, matched_keywords, missing_keywords

def calculate_formatting_score(text: str) -> tuple:
    score = 100
    issues = []
    suggestions = []
    
    date_patterns = [
        r'\b\d{1,2}/\d{4}\b',
        r'\b\d{1,2}-\d{4}\b',
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b',
        r'\b\d{4}-\d{2}\b'
    ]
    
    date_formats_found = set()
    for pattern in date_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            date_formats_found.add(pattern)
    
    if len(date_formats_found) > 1:
        score -= 10
        issues.append("Inconsistent date formatting detected")
        suggestions.append("Standardize all dates to MM/YYYY format")
    
    special_chars = re.findall(r'[^\w\s\-\.\,\(\)\/\@\%\&\+]', text)
    if len(set(special_chars)) > 5:
        score -= 5
        issues.append("Excessive special characters in headers")
        suggestions.append("Use plain text for section headers")
    
    lines = text.split('\n')
    if len(lines) > 100:
        score -= 5
        suggestions.append("Consider condensing resume to 1-2 pages")
    
    if not any(section in text.lower() for section in ['experience', 'work experience', 'employment']):
        score -= 15
        issues.append("Experience section not clearly labeled")
        suggestions.append("Add a clearly labeled 'Experience' or 'Work Experience' section")
    
    if not any(section in text.lower() for section in ['education', 'academic']):
        score -= 10
        issues.append("Education section not clearly labeled")
        suggestions.append("Add a clearly labeled 'Education' section")
    
    if not any(section in text.lower() for section in ['skills', 'technical skills']):
        score -= 10
        issues.append("Skills section not found")
        suggestions.append("Add a 'Skills' section to highlight your abilities")
    
    return max(0, score), issues, suggestions

def calculate_impact_score(text: str) -> tuple:
    score = 100
    quantified_results = []
    missing_metrics = []
    suggestions = []
    
    percentage_pattern = r'\d{1,3}%'
    numbers_with_context = r'(?:increased|decreased|improved|reduced|grew|saved|generated)\s+(?:by\s+)?[\$]?\d+(?:,\d{3})*(?:\.\d+)?(?:%|\s*(?:users|customers|revenue|sales|team members|employees))?'
    
    percentages = re.findall(percentage_pattern, text)
    quantified_phrases = re.findall(numbers_with_context, text, re.IGNORECASE)
    
    if len(percentages) >= 3:
        score = min(score, 90)
        quantified_results.extend([f"Found {len(percentages)} percentage metrics"])
    elif len(percentages) >= 1:
        score -= 10
        quantified_results.append(f"Found {len(percentages)} percentage metric(s)")
        suggestions.append("Add more percentage-based achievements (aim for 3+)")
    else:
        score -= 25
        missing_metrics.append("Percentage improvements")
        suggestions.append("Include percentage improvements for your achievements")
    
    if len(quantified_phrases) >= 5:
        score = min(score, 95)
        quantified_results.append(f"Found {len(quantified_phrases)} quantified achievements")
    elif len(quantified_phrases) >= 2:
        score -= 5
        suggestions.append("Quantify more achievements with specific numbers")
    else:
        score -= 15
        missing_metrics.append("Quantified achievements")
        suggestions.append("Add specific numbers to your accomplishments (e.g., 'increased sales by 25%')")
    
    dollar_pattern = r'\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|k|M|B))?'
    dollar_amounts = re.findall(dollar_pattern, text, re.IGNORECASE)
    
    if not dollar_amounts:
        missing_metrics.append("Revenue or budget figures")
        suggestions.append("Include budget sizes or revenue impact where applicable")
    else:
        quantified_results.append(f"Found {len(dollar_amounts)} monetary value(s)")
    
    team_size_pattern = r'(?:team|managed|led)\s+(?:of\s+)?(\d+)\s*(?:people|employees|engineers|developers|staff|team members)?'
    team_sizes = re.findall(team_size_pattern, text, re.IGNORECASE)
    
    if not team_sizes:
        missing_metrics.append("Team size metrics")
        suggestions.append("Mention the size of teams you've managed or worked with")
    else:
        quantified_results.append(f"Managed teams of various sizes")
    
    return max(0, score), quantified_results, missing_metrics, suggestions

def calculate_completeness_score(text: str) -> tuple:
    score = 100
    present_sections = []
    missing_sections = []
    suggestions = []
    
    sections = {
        'Contact Information': ['email', 'phone', 'linkedin', 'address', 'portfolio'],
        'Professional Summary': ['summary', 'objective', 'profile', 'about'],
        'Work Experience': ['experience', 'employment', 'work history', 'career history'],
        'Education': ['education', 'academic', 'degree', 'university', 'college'],
        'Skills': ['skills', 'technical skills', 'competencies', 'expertise'],
        'Certifications': ['certifications', 'certificates', 'licenses'],
        'Projects': ['projects', 'portfolio projects'],
        'Awards': ['awards', 'honors', 'achievements', 'recognition']
    }
    
    text_lower = text.lower()
    
    for section_name, keywords in sections.items():
        found = any(kw in text_lower for kw in keywords)
        if found:
            present_sections.append(section_name)
        else:
            missing_sections.append(section_name)
    
    required_sections = ['Contact Information', 'Work Experience', 'Education', 'Skills']
    for section in required_sections:
        if section in missing_sections:
            score -= 15
    
    optional_sections = ['Professional Summary', 'Certifications', 'Projects']
    for section in optional_sections:
        if section in missing_sections:
            score -= 5
    
    if 'Professional Summary' in missing_sections:
        suggestions.append("Add a Professional Summary section (2-3 sentences)")
    
    if 'Certifications' in missing_sections:
        suggestions.append("Include a Certifications section if you have any credentials")
    
    if 'Projects' in missing_sections:
        suggestions.append("Add a Projects section to showcase specific work")
    
    return max(0, score), present_sections, missing_sections, suggestions

def calculate_overall_score(
    keyword_score: int,
    formatting_score: int,
    impact_score: int,
    completeness_score: int
) -> int:
    weights = {
        'keyword': 0.30,
        'formatting': 0.25,
        'impact': 0.25,
        'completeness': 0.20
    }
    
    overall = (
        keyword_score * weights['keyword'] +
        formatting_score * weights['formatting'] +
        impact_score * weights['impact'] +
        completeness_score * weights['completeness']
    )
    
    return round(overall)

def generate_ai_analysis(text: str, scores: Dict[str, int], db: Session) -> Dict[str, Any]:
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.3,
        api_key=OPENAI_API_KEY
    )
    
    parser = PydanticOutputParser(pydantic_object=AnalysisResult)
    
    prompt_template = ChatPromptTemplate.from_template("""
    You are an expert resume reviewer and ATS specialist. Analyze the following resume text and provide detailed feedback.
    
    Resume Text:
    {resume_text}
    
    Pre-calculated Scores:
    - Keyword Match: {keyword_score}/100
    - Formatting: {formatting_score}/100
    - Measurable Impact: {impact_score}/100
    - Completeness: {completeness_score}/100
    - Overall ATS Score: {overall_score}/100
    
    Provide your analysis in the following JSON format:
    {format_instructions}
    
    Guidelines:
    1. Overall feedback should be 2-3 sentences summarizing strengths and weaknesses
    2. For keyword analysis, identify specific industry keywords found and missing
    3. For formatting, check ATS compatibility issues
    4. For impact analysis, identify quantified achievements and suggest improvements
    5. For completeness, verify all essential sections are present
    6. Improvement plan should be a 4-week actionable roadmap
    
    Be specific, actionable, and professional in your feedback.
    """)
    
    prompt = prompt_template.format(
        resume_text=text[:4000],
        keyword_score=scores['keyword'],
        formatting_score=scores['formatting'],
        impact_score=scores['impact'],
        completeness_score=scores['completeness'],
        overall_score=scores['overall'],
        format_instructions=parser.get_format_instructions()
    )
    
    try:
        response = llm.invoke(prompt)
        parsed_response = parser.parse(response.content)
        return parsed_response.dict()
    except Exception as e:
        return generate_fallback_analysis(text, scores)

def generate_fallback_analysis(text: str, scores: Dict[str, int]) -> Dict[str, Any]:
    return {
        "overall_feedback": f"Your resume scores {scores['overall']}/100. Focus on improving areas with lower scores for better ATS performance.",
        "keyword_analysis": {
            "score": scores['keyword'],
            "matched_keywords": ["Python", "JavaScript"],
            "missing_keywords": ["Project Management", "Agile"],
            "suggestions": ["Add more industry-specific keywords", "Review job descriptions for relevant terms"]
        },
        "formatting_analysis": {
            "score": scores['formatting'],
            "issues": [],
            "suggestions": ["Use standard section headers", "Ensure consistent date formatting"]
        },
        "impact_analysis": {
            "score": scores['impact'],
            "quantified_results": [],
            "missing_metrics": ["Revenue figures", "Team sizes"],
            "suggestions": ["Quantify achievements with numbers", "Include percentage improvements"]
        },
        "completeness_analysis": {
            "score": scores['completeness'],
            "present_sections": ["Contact", "Experience", "Education"],
            "missing_sections": ["Certifications"],
            "suggestions": ["Add missing sections", "Expand on professional summary"]
        },
        "improvement_plan": [
            "Week 1: Add missing keywords and standardize formatting",
            "Week 2: Quantify achievements with specific metrics",
            "Week 3: Add missing sections and expand content",
            "Week 4: Final review and optimization"
        ]
    }

@app.post("/api/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        return existing_user
    
    db_user = User(
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        google_id=user.google_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/api/users/email/{email}", response_model=UserResponse)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/resumes/analyze", response_model=ResumeResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    user_id: str = None,
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    temp_dir = "/tmp/resume_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    
    file_path = f"{temp_dir}/{uuid.uuid4()}_{file.filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        extracted_text = extract_text_from_pdf(file_path)
        
        keyword_score, matched_keywords, missing_keywords = calculate_keyword_score(extracted_text, db)
        formatting_score, formatting_issues, formatting_suggestions = calculate_formatting_score(extracted_text)
        impact_score, quantified_results, missing_metrics, impact_suggestions = calculate_impact_score(extracted_text)
        completeness_score, present_sections, missing_sections, completeness_suggestions = calculate_completeness_score(extracted_text)
        
        overall_score = calculate_overall_score(
            keyword_score,
            formatting_score,
            impact_score,
            completeness_score
        )
        
        scores = {
            'keyword': keyword_score,
            'formatting': formatting_score,
            'impact': impact_score,
            'completeness': completeness_score,
            'overall': overall_score
        }
        
        ai_analysis = generate_ai_analysis(extracted_text, scores, db)
        
        db_resume = Resume(
            user_id=uuid.UUID(user_id) if user_id else None,
            filename=file.filename,
            file_url=file_path,
            file_size=len(content),
            extracted_text=extracted_text,
            ats_score=overall_score,
            keyword_score=keyword_score,
            formatting_score=formatting_score,
            impact_score=impact_score,
            completeness_score=completeness_score,
            analysis_result=ai_analysis
        )
        
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)
        
        return db_resume
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resumes/user/{user_id}", response_model=List[ResumeResponse])
def get_user_resumes(user_id: str, db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(
        Resume.user_id == uuid.UUID(user_id)
    ).order_by(Resume.created_at.desc()).all()
    return resumes

@app.get("/api/resumes/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == uuid.UUID(resume_id)).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@app.delete("/api/resumes/{resume_id}")
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == uuid.UUID(resume_id)).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if os.path.exists(resume.file_url):
        os.remove(resume.file_url)
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}

@app.get("/api/scores/calculate")
def get_score_calculation_info():
    return {
        "weights": {
            "keyword_match": 0.30,
            "formatting": 0.25,
            "measurable_impact": 0.25,
            "section_completeness": 0.20
        },
        "description": {
            "keyword_match": "Percentage of industry-relevant keywords found in the resume",
            "formatting": "ATS-friendly formatting and structure assessment",
            "measurable_impact": "Presence of quantified achievements and results",
            "section_completeness": "Coverage of essential resume sections"
        },
        "formula": "overall_score = (keyword * 0.30) + (formatting * 0.25) + (impact * 0.25) + (completeness * 0.20)"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
