CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    extracted_text TEXT,
    ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
    keyword_score INTEGER CHECK (keyword_score >= 0 AND keyword_score <= 100),
    formatting_score INTEGER CHECK (formatting_score >= 0 AND formatting_score <= 100),
    impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
    completeness_score INTEGER CHECK (completeness_score >= 0 AND completeness_score <= 100),
    analysis_result JSONB,
    job_description TEXT,
    target_role VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_created_at ON resumes(created_at DESC);

CREATE TABLE resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changes_description TEXT,
    ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);

CREATE TABLE keyword_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES keyword_categories(id) ON DELETE SET NULL,
    keyword VARCHAR(255) NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.00,
    industry VARCHAR(100),
    is_technical BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_keywords_category ON keywords(category_id);
CREATE INDEX idx_keywords_industry ON keywords(industry);

CREATE TABLE resume_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    found_in_section VARCHAR(100),
    match_type VARCHAR(20) CHECK (match_type IN ('exact', 'partial', 'synonym')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resume_id, keyword_id)
);

CREATE INDEX idx_resume_keywords_resume ON resume_keywords(resume_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE VIEW user_resume_stats AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    COUNT(r.id) as total_resumes,
    MAX(r.ats_score) as best_score,
    AVG(r.ats_score)::INTEGER as average_score,
    MAX(r.created_at) as last_upload_date
FROM users u
LEFT JOIN resumes r ON u.id = r.user_id
GROUP BY u.id, u.email, u.name;

INSERT INTO keyword_categories (name, description, industry) VALUES
('Technical Skills', 'Programming languages, frameworks, and tools', 'technology'),
('Soft Skills', 'Interpersonal and communication abilities', 'all'),
('Management', 'Leadership and project management skills', 'all'),
('Domain Knowledge', 'Industry-specific expertise', 'varies'),
('Certifications', 'Professional certifications and credentials', 'all');

INSERT INTO keywords (category_id, keyword, weight, industry, is_technical) VALUES
((SELECT id FROM keyword_categories WHERE name = 'Technical Skills'), 'Python', 1.0, 'technology', TRUE),
((SELECT id FROM keyword_categories WHERE name = 'Technical Skills'), 'JavaScript', 1.0, 'technology', TRUE),
((SELECT id FROM keyword_categories WHERE name = 'Technical Skills'), 'React', 0.9, 'technology', TRUE),
((SELECT id FROM keyword_categories WHERE name = 'Technical Skills'), 'Node.js', 0.9, 'technology', TRUE),
((SELECT id FROM keyword_categories WHERE name = 'Technical Skills'), 'SQL', 0.9, 'technology', TRUE),
((SELECT id FROM keyword_categories WHERE name = 'Technical Skills'), 'AWS', 0.9, 'technology', TRUE),
((SELECT id FROM keyword_categories WHERE name = 'Technical Skills'), 'Docker', 0.8, 'technology', TRUE),
((SELECT id FROM keyword_categories WHERE name = 'Technical Skills'), 'Kubernetes', 0.8, 'technology', TRUE),
((SELECT id FROM keyword_categories WHERE name = 'Soft Skills'), 'Communication', 0.9, 'all', FALSE),
((SELECT id FROM keyword_categories WHERE name = 'Soft Skills'), 'Leadership', 0.9, 'all', FALSE),
((SELECT id FROM keyword_categories WHERE name = 'Soft Skills'), 'Problem Solving', 0.8, 'all', FALSE),
((SELECT id FROM keyword_categories WHERE name = 'Management'), 'Project Management', 0.9, 'all', FALSE),
((SELECT id FROM keyword_categories WHERE name = 'Management'), 'Agile', 0.9, 'all', FALSE),
((SELECT id FROM keyword_categories WHERE name = 'Management'), 'Team Leadership', 0.9, 'all', FALSE),
((SELECT id FROM keyword_categories WHERE name = 'Management'), 'Stakeholder Management', 0.8, 'all', FALSE);
