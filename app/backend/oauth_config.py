from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from jose import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from main import get_db, User, UserResponse

router = APIRouter(prefix="/api/auth", tags=["authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/google/login")
def google_login():
    redirect_uri = os.getenv("FRONTEND_URL", "http://localhost:5173") + "/auth/callback"
    
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
    )
    
    return RedirectResponse(url=google_auth_url)

@router.post("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    import httpx
    
    token_url = "https://oauth2.googleapis.com/token"
    redirect_uri = os.getenv("FRONTEND_URL", "http://localhost:5173") + "/auth/callback"
    
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }
    
    try:
        with httpx.Client() as client:
            token_response = client.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()
        
        idinfo = id_token.verify_oauth2_token(
            tokens["id_token"],
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise HTTPException(status_code=401, detail="Invalid issuer")
        
        email = idinfo.get("email")
        name = idinfo.get("name", email.split("@")[0])
        picture = idinfo.get("picture")
        google_id = idinfo.get("sub")
        
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            user.name = name
            user.avatar_url = picture
            user.google_id = google_id
            db.commit()
            db.refresh(user)
        else:
            user = User(
                email=email,
                name=name,
                avatar_url=picture,
                google_id=google_id
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        access_token = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "name": user.name
        })
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

@router.get("/me", response_model=UserResponse)
def get_current_user(token: str, db: Session = Depends(get_db)):
    payload = verify_token(token)
    user_id = payload.get("sub")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
