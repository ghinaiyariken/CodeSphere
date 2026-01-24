import spacy
from typing import List, Set, Dict, Any
from collections import Counter
import re

# Load NLP model
nlp = spacy.load("en_core_web_sm")

def extract_keywords(text: str) -> Set[str]:
    """
    Extracts potential skills and important keywords from text using NLP.
    Focuses on Nouns and Proper Nouns.
    """
    doc = nlp(text.lower())
    keywords = set()
    
    # Extract noun chunks and named entities
    for token in doc:
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and len(token.text) > 2:
            keywords.add(token.text)
            
    # Also look for common tech skills manually if NLP misses them (basic list)
    common_skills = [
        "python", "java", "javascript", "react", "node", "aws", "docker", 
        "kubernetes", "sql", "nosql", "fastapi", "django", "flask", "html", 
        "css", "tailwind", "typescript", "git", "linux", "agile", "scrum",
        "communication", "leadership", "problem solving"
    ]
    
    for skill in common_skills:
        if skill in text.lower():
            keywords.add(skill)
            
    return keywords

def calculate_similarity(resume_text: str, jd_text: str) -> Dict[str, Any]:
    """
    Compares Resume text against Job Description text and returns analysis.
    """
    resume_doc = nlp(resume_text.lower())
    jd_doc = nlp(jd_text.lower())
    
    # 1. Extract Keywords from JD (The "Gold Standard")
    jd_keywords = extract_keywords(jd_text)
    
    # 2. Check which JD keywords are present in Resume
    resume_keywords = extract_keywords(resume_text)
    
    matched_keywords = []
    missing_keywords = []
    
    for keyword in jd_keywords:
        # Simple containment check is often robust enough for single words
        # For multi-word terms, we'd need phrase matching, but we'll stick to tokens for now
        if keyword in resume_text.lower():
            matched_keywords.append(keyword)
        else:
            missing_keywords.append(keyword)
            
    # 3. Calculate Score
    # Weight: (Matched / Total JD Keywords) * 100
    if not jd_keywords:
        score = 0
    else:
        score = int((len(matched_keywords) / len(jd_keywords)) * 100)
        
    # Cap score if it's too low but some match exists (to be encouraging)
    if score < 20 and len(matched_keywords) > 0:
        score = 20
        
    # 4. Generate Suggestions
    suggestions = []
    
    # Score-based general suggestions
    if score < 40:
        suggestions.append("⚠️ Critically low match: Your resume is missing most of the core requirements. Consider a major rewrite focused on these specific JD keywords.")
    elif score < 70:
        suggestions.append("📈 Good start: Your profile has potential. Add more industry-specific keywords and quantify your achievements to reach 80%+")
    else:
        suggestions.append("✅ Excellent alignment! Your resume is highly optimized for this role. Focus now on visual clarity and contact info.")

    # Keyword-specific suggestions
    if missing_keywords:
        top_missing = missing_keywords[:3]
        suggestions.append(f"💡 Skill Gap: Missing critical keywords: {', '.join(top_missing)}. Try to include these in your 'Experience' or 'Skills' section.")
        
    # Formatting/Section suggestions
    sections_missing = []
    lower_resume = resume_text.lower()
    if "education" not in lower_resume and "study" not in lower_resume:
        sections_missing.append("Education")
    if "experience" not in lower_resume and "work history" not in lower_resume:
        sections_missing.append("Work Experience")
    if "projects" not in lower_resume and "portfolio" not in lower_resume:
        sections_missing.append("Projects")
        
    if sections_missing:
        suggestions.append(f"📁 Structuring: We couldn't clearly identify your {', '.join(sections_missing)} sections. Ensure these headers are clear for ATS bots.")

    # Density/Length suggestions
    word_count = len(resume_text.split())
    if word_count < 250:
        suggestions.append("📝 Content Depth: Your resume is quite short. Professional resumes are typically 400-600 words to provide enough context for ATS.")
    elif word_count > 1000:
        suggestions.append("✂️ Length Warning: Your resume is very long. Recruiters prefer 1-2 pages. Try to be more concise.")

    # Quantifiable results
    if not any(char.isdigit() for char in resume_text):
        suggestions.append("📊 Missing Metrics: We didn't detect many numbers. Recruiters love quantifiable results (e.g., 'Improved efficiency by 20%').")

    return {
        "score": score,
        "matched_keywords": sorted(list(set(matched_keywords))),
        "missing_keywords": sorted(list(set(missing_keywords))),
        "total_keywords": len(jd_keywords),
        "suggestions": suggestions
    }
