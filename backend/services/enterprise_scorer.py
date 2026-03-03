import re
import numpy as np
from typing import Dict, List, Any, Tuple
from sentence_transformers import SentenceTransformer, util
from .models import ParsedResume, ExperienceItem
from .parser import parse_resume

# Lazy load model
_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

class EnterpriseScorer:
    def __init__(self):
        self.model = get_model()

    def calculate_semantic_score(self, resume_text: str, jd_text: str) -> float:
        """35% Semantic Matching Score"""
        resume_emb = self.model.encode(resume_text, convert_to_tensor=True)
        jd_emb = self.model.encode(jd_text, convert_to_tensor=True)
        similarity = util.cos_sim(resume_emb, jd_emb)
        score = float(similarity[0][0]) * 100
        return max(0, min(100, score))

    def calculate_experience_score(self, parsed_resume: ParsedResume, jd_text: str) -> float:
        """25% Experience Relevance Score"""
        # 1. Title Similarity
        jd_titles = ["engineer", "developer", "manager", "lead", "architect", "analyst", "specialist", "designer", "consultant"]
        detected_jd_titles = [t for t in jd_titles if t in jd_text.lower()]
        if not detected_jd_titles: detected_jd_titles = ["professional"] # Fallback
        
        resume_titles = [exp.title.lower() for exp in parsed_resume.experience]
        # Fallback: if no experience items, check summary and full text for titles
        if not resume_titles:
             for t in jd_titles:
                 if f" {t}" in parsed_resume.full_text.lower():
                     resume_titles.append(t)

        title_match = 0
        for rt in resume_titles:
            if any(jt in rt for jt in detected_jd_titles):
                title_match = 100
                break
        
        # 2. Duration Relevance
        req_years_search = re.search(r'(\d+)\+?\s*(?:years|yrs)', jd_text.lower())
        req_years = int(req_years_search.group(1)) if req_years_search else 2
        
        # If parser found 0, but text has years, use text search
        years_to_use = parsed_resume.total_experience_years
        if years_to_use == 0:
            years_match = re.search(r'(\d+)\+?\s*years', parsed_resume.full_text.lower())
            if years_match:
                years_to_use = float(years_match.group(1))

        duration_score = (years_to_use / req_years) * 100 if req_years > 0 else 100
        duration_score = min(100, max(20 if years_to_use > 0 else 0, duration_score)) # Baseline of 20 if any exp
        
        # 3. Project / JD Alignment
        exp_text = " ".join([exp.description for exp in parsed_resume.experience])
        if not exp_text.strip():
            exp_text = parsed_resume.full_text # Fallback to full text if no exp section
            
        proj_score = self.calculate_semantic_score(exp_text, jd_text)
        
        # Ensure we don't have a pure 0 if there is text
        score = (title_match * 0.4) + (duration_score * 0.3) + (proj_score * 0.3)
        return max(15.0 if parsed_resume.word_count > 50 else 0, score)

    def calculate_readability_score(self, parsed_resume: ParsedResume) -> float:
        """15% Resume Readability Score"""
        score = 100
        metrics = parsed_resume.readability_metrics
        
        if metrics.get("has_tables"):
            score -= 10 # Reduced penalty
        
        bullets = metrics.get("bullet_points", 0)
        if bullets < 3:
            score -= 10
            
        if not metrics.get("headers_standard"):
            score -= 10
            
        if parsed_resume.word_count < 100:
            score -= 30
            
        return max(20.0, score) # Baseline readability

    def calculate_achievement_score(self, text: str) -> float:
        """15% Achievement Impact Score - Quantified Results & Power Verbs"""
        text_low = text.lower()
        
        # 1. Metric Detection (%, $, numbers with context)
        metrics = re.findall(r'(\d+%\s*(?:increase|reduction|growth|improvement)|[\$\d,]+\+?\s*(?:revenue|budget|savings|users|clients)|(?:\d+|some|many)\s*(?:projects|teams|stakeholders))', text_low)
        
        # 2. Power Verb Detection
        from .knowledge_base import POWER_VERBS
        all_power_verbs = [v for category in POWER_VERBS.values() for v in category]
        verb_count = sum(1 for v in all_power_verbs if v in text_low)
        
        # Calculate Score
        metric_score = len(metrics) * 20
        verb_score = verb_count * 5
        
        total = metric_score + verb_score
        return min(100, max(5 if len(text) > 100 else 0, total))

    def calculate_skill_density_score(self, parsed_resume: ParsedResume, jd_text: str) -> float:
        """10% Skill Density Score"""
        try:
            from .utils import extract_keywords_util
            jd_keywords = extract_keywords_util(jd_text)
        except:
            jd_keywords = []

        if not jd_keywords:
            return 50 # Neutral if no keywords found
            
        matches = 0
        text_lower = parsed_resume.full_text.lower()
        
        for kw in jd_keywords:
            if kw.lower() in text_lower:
                matches += 1
                count = len(re.findall(rf'\b{re.escape(kw.lower())}\b', text_lower))
                if count > 1:
                    matches += 0.5
        
        score = (matches / len(jd_keywords)) * 100
        return min(100, max(10 if matches > 0 else 0, score))

    def generate_suggestions(self, scores: Dict[str, float], parsed_resume: ParsedResume, jd_text: str) -> List[str]:
        suggestions = []
        resume_text_low = parsed_resume.full_text.lower()
        
        # 1. Skill Gap Analysis (High Priority)
        from .utils import extract_keywords_util
        jd_keywords = extract_keywords_util(jd_text)
        missing = [kw for kw in jd_keywords if kw.lower() not in resume_text_low]
        
        if missing:
            top_missing = missing[:3]
            suggestions.append(f"CRITICAL: Your resume is missing core keywords: {', '.join(top_missing)}. Try integrating these naturally into your experience section.")

        # 2. Power Word Upgrade
        from .knowledge_base import WEAK_WORDS_MAP
        found_weak = [weak for weak in WEAK_WORDS_MAP.keys() if f" {weak} " in f" {resume_text_low} "]
        if found_weak:
            weak = found_weak[0]
            suggestions.append(f"LANGUAGE: Replace weak phrases like '{weak}' with stronger action verbs (e.g., {', '.join(WEAK_WORDS_MAP[weak][:2])}).")

        # 3. Impact & Quantification
        if scores["AchievementScore"] < 50:
            suggestions.append("IMPACT: Quantify your achievements. Instead of 'Managed projects', use 'Managed 5+ cross-functional projects, reducing delivery time by 15%'.")
        
        # 4. Presentation & Formatting
        if scores["ReadabilityScore"] < 70:
            if not parsed_resume.readability_metrics.get("headers_standard"):
                suggestions.append("FORMAT: Use standard section headers (e.g., 'Work Experience' instead of 'What I've Done') to help ATS robots parse your file.")
            if parsed_resume.readability_metrics.get("bullet_points", 0) < 5:
                suggestions.append("STRUCTURE: Convert dense paragraphs into bullet points. Large blocks of text are often ignored by ATS scanners.")

        # Default if everything is great
        if not suggestions:
            suggestions.append("ELITE: Your resume is highly optimized! Ensure your LinkedIn profile has the same keywords to increase recruiter reach.")
            
        return suggestions[:4] # Keep it concise for the UI

    def get_full_analysis(self, resume_text: str, jd_text: str) -> Dict[str, Any]:
        try:
            # Handle None or empty inputs
            resume_text = resume_text or ""
            jd_text = jd_text or ""
            
            if len(resume_text.strip()) < 10 or len(jd_text.strip()) < 10:
                return {
                    "ATSScore": 0, "SkillMatchScore": 0, "ExperienceScore": 0, "ReadabilityScore": 0, 
                    "AchievementScore": 0, "SkillDensityScore": 0, 
                    "Suggestions": ["Please provide both a valid resume and a job description."],
                    "matched_keywords": [], "missing_keywords": [], "total_keywords": 0
                }

            parsed_resume = parse_resume(resume_text)
            
            # Keyword Analysis for UI components (using new utility)
            from .utils import extract_keywords_util
            jd_keywords = extract_keywords_util(jd_text)
            resume_keywords = extract_keywords_util(resume_text)
            
            matched = sorted(list(jd_keywords.intersection(resume_keywords)))[:15]
            missing = sorted(list(jd_keywords - resume_keywords))[:15]

            semantic_score = self.calculate_semantic_score(resume_text, jd_text)
            experience_score = self.calculate_experience_score(parsed_resume, jd_text)
            readability_score = self.calculate_readability_score(parsed_resume)
            achievement_score = self.calculate_achievement_score(resume_text)
            skill_density_score = self.calculate_skill_density_score(parsed_resume, jd_text)
            
            # Weighted Final Score
            final_score = (
                (semantic_score * 0.35) +
                (experience_score * 0.25) +
                (readability_score * 0.15) +
                (achievement_score * 0.15) +
                (skill_density_score * 0.10)
            )
            
            # Ensure it's not exactly 0 if there's any match
            if final_score < 5 and semantic_score > 0:
                final_score = 10 + semantic_score * 0.1
                
            scores = {
                "ATSScore": round(min(100, final_score), 2),
                "SkillMatchScore": round(semantic_score, 2),
                "ExperienceScore": round(experience_score, 2),
                "ReadabilityScore": round(readability_score, 2),
                "AchievementScore": round(achievement_score, 2),
                "SkillDensityScore": round(skill_density_score, 2),
                "matched_keywords": matched,
                "missing_keywords": missing,
                "total_keywords": len(jd_keywords)
            }
            
            suggestions = self.generate_suggestions(scores, parsed_resume, jd_text)
            
            return {
                **scores,
                "Suggestions": suggestions,
                "parsed_resume": parsed_resume.dict()
            }
        except Exception as e:
            print(f"ERROR in get_full_analysis: {str(e)}")
            # Return a safe error object instead of crashing
            return {
                "ATSScore": 0, "SkillMatchScore": 0, "ExperienceScore": 0, "ReadabilityScore": 0, 
                "AchievementScore": 0, "SkillDensityScore": 0, 
                "Suggestions": [f"Analysis Error: {str(e)}"],
                "matched_keywords": [], "missing_keywords": [], "total_keywords": 0
            }
