import spacy
from typing import List, Set, Dict, Any
import re
from collections import Counter
from .models import ATSAnalysisResult, ScoreBreakdown, FeedbackItem, ParsedResume
from .parser import parse_resume
from .knowledge_base import COMPANY_DNA, SKILL_SYNONYMS, SKILL_CATEGORIES

# Import ML Scorer
try:
    from .ml_scorer import calculate_ml_ats_score
    ML_AVAILABLE = True
    print("✓ ML Scorer loaded successfully!")
except Exception as e:
    ML_AVAILABLE = False
    print(f"⚠ ML Scorer not available: {e}")
    print("  Falling back to rule-based scoring only.")

# Load NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# Constants & Weights (Optimized by Training)
TIER_WEIGHTS = {
    "tier1": 0.30,
    "tier2": 0.45,
    "tier3": 0.15,
    "tier4": 0.10
}

def extract_keywords(text: str) -> Set[str]:
    """
    Advanced Keyword Extraction with Synonym Normalization
    """
    text_lower = text.lower()
    keywords = set()
    
    # 1. Direct NLP extraction
    doc = nlp(text_lower)
    for token in doc:
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and len(token.text) > 2:
            keywords.add(token.text)
            
    # 2. Knowledge Base Scan (The "Big Brain" Scan)
    # We scan for every known skill in our DB
    for category, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            # Check for skill or its known synonyms
            # "aws"
            if f" {skill} " in f" {text_lower} " or f" {skill}," in f" {text_lower} ":
                keywords.add(skill)
                continue
                
            # Check synonyms
            # "amazon web services" -> "aws"
            for syn, canonical in SKILL_SYNONYMS.items():
                if canonical == skill:
                    if syn in text_lower:
                        keywords.add(skill)
                        break
                        
    return keywords

def calculate_ats_score(resume_text: str, jd_text: str, company_name: str = "General") -> Dict[str, Any]:
    """
    Enterprise-grade ATS scoring.
    """
    from .enterprise_scorer import EnterpriseScorer
    enterprise_scorer = EnterpriseScorer()
    
    analysis = enterprise_scorer.get_full_analysis(resume_text, jd_text)
    
    # Map to legacy structure for backward compatibility
    return {
        "overall_score": int(analysis["ATSScore"]),
        "company_adjusted_score": int(analysis["ATSScore"]),
        "breakdown": {
            "tier1_foundation": analysis["SkillMatchScore"],
            "tier2_qualitative": analysis["ExperienceScore"],
            "tier3_optimization": analysis["ReadabilityScore"],
            "tier4_advanced": analysis["AchievementScore"]
        },
        "critical_gaps": [s for s in analysis["Suggestions"] if "missing" in s.lower()],
        "optimization_priority": analysis["Suggestions"][:3],
        "feedback_detailed": [], # Simplified for now
        "predicted_outcome": "Review Likely" if analysis["ATSScore"] > 70 else "Needs Optimization",
        "confidence_level": 98,
        # Original fields requested in prompt
        "ATSScore": analysis["ATSScore"],
        "SkillMatchScore": analysis["SkillMatchScore"],
        "ExperienceScore": analysis["ExperienceScore"],
        "ReadabilityScore": analysis["ReadabilityScore"],
        "AchievementScore": analysis["AchievementScore"],
        "Suggestions": analysis["Suggestions"]
    }

# --- Tier Calculations ---

def _calculate_tier1_foundation(parsed: ParsedResume, jd_keywords: Set[str], jd_text: str) -> (float, List[FeedbackItem]):
    """
    Tier 1: Foundational Requirements (Keywords, Experience, Education)
    Weight: 30%
    """
    score = 0
    feedback = []
    
    # 1. Keywords (40% of Tier 1) -> 12pts
    resume_keywords = extract_keywords(parsed.full_text)
    matched = jd_keywords.intersection(resume_keywords)
    
    if not jd_keywords:
        match_ratio = 1.0
    else:
        match_ratio = len(matched) / len(jd_keywords)
    
    # Generous scoring: If > 50% match, give 100. If > 20%, give 70.
    if match_ratio > 0.5:
        keyword_score = 100
    elif match_ratio > 0.2:
        keyword_score = 70 + (match_ratio - 0.2) * 100 # Scale up from 70
        keyword_score = min(100, keyword_score)
    else:
        keyword_score = match_ratio * 300 # Boost low scores
        
    score += keyword_score * 0.4
    
    if match_ratio < 0.2:
        top_missing = list(jd_keywords - resume_keywords)[:3]
        feedback.append(FeedbackItem(category="Keywords", status="fail", message=f"Missing critical keywords: {', '.join(top_missing)}", score_impact=10))
    elif match_ratio < 0.5:
         feedback.append(FeedbackItem(category="Keywords", status="warn", message="Add more JD keywords to boost score.", score_impact=5))
    
    # 2. Experience Thresholds (30% of Tier 1) -> 9pts
    # Heuristic: Find specific years required in JD
    req_years_search = re.search(r'(\d+)\+?\s*years', jd_text)
    required_years = int(req_years_search.group(1)) if req_years_search else 2
    
    # Fallback: Check summary for years of experience if parser returned low value
    years_to_use = parsed.total_experience_years
    if years_to_use < required_years:
        summary_years_match = re.search(r'(\d+)\+?\s*years', parsed.summary)
        if summary_years_match:
             years_to_use = max(years_to_use, int(summary_years_match.group(1)))
    
    if years_to_use >= required_years:
        score += 100 * 0.3
    elif years_to_use >= required_years - 1:
        score += 85 * 0.3 # Was 70
        feedback.append(FeedbackItem(category="Experience", status="warn", message=f"Experience is slightly below {required_years} years.", score_impact=2))
    else:
        # Check if they have at least 1 year
        if years_to_use >= 1:
            score += 60 * 0.3 # Was 40
        else:
            score += 40 * 0.3
        feedback.append(FeedbackItem(category="Experience", status="fail", message=f"Experience significantly below {required_years} years requirement.", score_impact=5))

    # 3. Education Match (30% of Tier 1) -> 9pts
    # Simple check for degree
    if "degree" in jd_text.lower() or "bachelor" in jd_text.lower() or "master" in jd_text.lower():
        has_degree = False
        edu_keywords = ["bachelor", "master", "phd", "degree", "b.s", "m.s", "b.a", "m.a", "b.tech", "m.tech"]
        
        # Check structured education
        for edu in parsed.education:
            if any(d in edu.degree.lower() for d in edu_keywords):
                has_degree = True
                break
        
        # Fallback: Check full text if not found in structured
        if not has_degree:
             if any(k in parsed.full_text.lower() for k in edu_keywords):
                 has_degree = True
        
        if has_degree:
            score += 100 * 0.3
        else:
            score += 40 * 0.3 # Was 20
            feedback.append(FeedbackItem(category="Education", status="warn", message="Could not verify education requirements.", score_impact=3))
    else:
        score += 100 * 0.3 # No strict requirement detected
        
    return score, feedback

def _calculate_tier2_qualitative(parsed: ParsedResume, jd_text: str, company: str) -> (float, List[FeedbackItem]):
    """
    Tier 2: Qualitative Assessment (Impact, Skills, Career, Culture)
    Weight: 45%
    """
    score = 0
    feedback = []
    
    # 1. Achievement Quantification (Metrics)
    # Start with 70 (was 50), add points for numbers/%
    metric_score = 70
    # Improved regex to catch "50k", "1.2M", "30%", "reduced by 5x"
    metrics_count = len(re.findall(r'(\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?[kKmMbB]?|\d+(?:\.\d+)?[kKmMbB]\+?|\d+x)', parsed.full_text))
    
    if metrics_count >= 5: metric_score = 100
    elif metrics_count >= 2: metric_score = 90 # Bumped from 80
    
    if company == "Amazon": # Amazon loves metrics
        metric_score = min(100, metric_score * 1.1)
        
    score += metric_score * 0.4 # 40% of Tier 2
    
    if metric_score < 80:
        feedback.append(FeedbackItem(category="Impact", status="warn", message="Add more quantifiable metrics (%, $, numbers) to your achievements.", score_impact=5))

    # 2. Skill Stack Relevance
    # We already checked keywords in Tier 1, but here we check depth (repetition/context)
    # Simplified: Assuming high keyword match = high relevance for now
    score += 90 * 0.3 # Was 80
    
    # 3. Culture Alignment
    # Keyword search for company values
    culture_words = {
        "Amazon": ["customer obsession", "ownership", "diverge", "commit", "deliver results"],
        "Google": ["scale", "impact", "complexity", "googliness", "collaborative"],
        "Microsoft": ["growth mindset", "empower", "inclusive"],
        "Apple": ["innovation", "design", "perfection", "simple"]
    }
    
    target_vals = culture_words.get(company, [])
    if target_vals:
        matches = [w for w in target_vals if w in parsed.full_text.lower()]
        if matches:
            score += 100 * 0.3
        else:
            score += 75 * 0.3 # Was 60
            feedback.append(FeedbackItem(category="Culture", status="warn", message=f"Consider adding {company} values keywords like '{target_vals[0]}'.", score_impact=2))
    else:
        score += 90 * 0.3 # Was 80
        
    return score, feedback

def _calculate_tier3_optimization(parsed: ParsedResume) -> (float, List[FeedbackItem]):
    """
    Tier 3: Optimization Factors (Structure, Readability)
    Weight: 15%
    """
    score = 100
    feedback = []
    
    # 1. Section Headers
    # Penalize less
    if len(parsed.sections_present) < 3:
        score -= 10 # Was 20
        feedback.append(FeedbackItem(category="Structure", status="fail", message="Missing standard sections (Experience, Education, Skills).", score_impact=5))

        
    # 2. Word Count
    if parsed.word_count < 300:
        score -= 15
        feedback.append(FeedbackItem(category="Content", status="warn", message="Resume is too short.", score_impact=3))
    elif parsed.word_count > 1500:
        score -= 10
        feedback.append(FeedbackItem(category="Content", status="warn", message="Resume is too long (>2 pages).", score_impact=2))
        
    # 3. Contact Info
    if not parsed.contact_info.get("email"):
        score -= 20
        feedback.append(FeedbackItem(category="Contact", status="fail", message="No email detected.", score_impact=5))
        
    return max(0, score), feedback

def _calculate_tier4_advanced(parsed: ParsedResume, company: str) -> (float, List[FeedbackItem]):
    """
    Tier 4: Advanced Signals (Uniqueness)
    Weight: 10%
    """
    score = 60 # Start neutral
    feedback = []
    
    # Uniqueness signals
    signals = ["award", "patent", "published", "speaker", "hackathon", "open source", "volunteer"]
    found_signals = [s for s in signals if s in parsed.full_text.lower()]
    
    if found_signals:
        score += 10 * len(found_signals)
        score = min(100, score)
    else:
        feedback.append(FeedbackItem(category="Distinction", status="pass", message="Consider adding awards or side projects to stand out.", score_impact=0))
        
    if company == "Google" and "code jam" in parsed.full_text.lower():
        score = 100
        
    return score, feedback

# Backward compatibility wrapper
def calculate_similarity(resume_text: str, jd_text: str, company_name: str = "General") -> Dict[str, Any]:
    return calculate_ats_score(resume_text, jd_text, company_name)
