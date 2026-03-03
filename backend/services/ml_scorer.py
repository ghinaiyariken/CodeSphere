"""
ML-Powered ATS Scorer using Sentence Transformers
This module provides semantic similarity scoring between resumes and job descriptions.
"""

from sentence_transformers import SentenceTransformer, util
import torch
from typing import Dict, List, Tuple, Optional
import re

# Global model instance (lazy loading)
_model: Optional[SentenceTransformer] = None

def get_model() -> SentenceTransformer:
    """
    Lazy load the Sentence Transformer model.
    Only loads when first called, not at import time.
    """
    global _model
    if _model is None:
        print("🔄 Loading Sentence Transformer model (first time only)...")
        _model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Model loaded successfully!")
    return _model

def calculate_semantic_similarity(resume_text: str, jd_text: str) -> float:
    """
    Calculates semantic similarity between resume and job description using BERT embeddings.
    Returns a score between 0 and 1.
    """
    model = get_model()
    
    # Encode both texts into embeddings
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    jd_embedding = model.encode(jd_text, convert_to_tensor=True)
    
    # Calculate cosine similarity
    similarity = util.cos_sim(resume_embedding, jd_embedding)
    
    # Convert to float (0-1 scale)
    return float(similarity[0][0])

def calculate_ml_ats_score(resume_text: str, jd_text: str) -> Dict[str, any]:
    """
    Main ML-based ATS scoring function.
    Returns detailed scoring breakdown.
    """
    # 1. Overall Semantic Similarity (This is the "ML Magic")
    overall_similarity = calculate_semantic_similarity(resume_text, jd_text)
    
    # 2. Extract keywords from both texts using simple matching
    # (Simplified for reliability - the semantic similarity is the main ML feature)
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()
    
    # Common tech skills
    tech_skills = [
        "python", "java", "javascript", "react", "node", "aws", "docker",
        "kubernetes", "sql", "mongodb", "machine learning", "tensorflow",
        "pytorch", "ci/cd", "agile"
    ]
    
    jd_skills = [skill for skill in tech_skills if skill in jd_lower]
    resume_skills = [skill for skill in tech_skills if skill in resume_lower]
    
    matched_skills = set(jd_skills).intersection(set(resume_skills))
    missing_skills = set(jd_skills) - set(resume_skills)
    
    # 3. Calculate final ML score (0-100 scale)
    # Heavily weighted toward semantic similarity (the AI magic)
    skill_match_ratio = len(matched_skills) / len(jd_skills) if jd_skills else 0
    ml_score = (overall_similarity * 0.7 + skill_match_ratio * 0.3) * 100
    
    return {
        "ml_score": int(ml_score),
        "semantic_similarity": round(overall_similarity * 100, 2),
        "skill_match_ratio": round(skill_match_ratio * 100, 2),
        "matched_skills": list(matched_skills),
        "missing_skills": list(missing_skills),
        "confidence": "high" if overall_similarity > 0.7 else "medium" if overall_similarity > 0.5 else "low"
    }

