from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class ResumeSection(BaseModel):
    text: str
    keywords: List[str] = []

class EducationItem(BaseModel):
    degree: str
    institution: str
    year: Optional[str] = None

class ExperienceItem(BaseModel):
    title: str
    company: str
    duration: str
    description: str
    years: float = 0.0

class ParsedResume(BaseModel):
    full_text: str
    contact_info: Dict[str, str] = {}
    summary: str = ""
    skills: List[str] = []
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    projects: List[ResumeSection] = []
    certifications: List[str] = []
    tools_and_technologies: List[str] = []
    total_experience_years: float = 0.0
    sections_present: List[str] = []
    word_count: int = 0
    readability_metrics: Dict[str, Any] = {}

class FeedbackItem(BaseModel):
    category: str  # e.g., "Impact", "Keywords"
    status: str    # "pass", "warn", "fail"
    message: str
    score_impact: float = 0.0

class ScoreBreakdown(BaseModel):
    tier1_foundation: float
    tier2_qualitative: float
    tier3_optimization: float
    tier4_advanced: float
    company_adjustment: float = 1.0

class ATSAnalysisResult(BaseModel):
    overall_score: int
    company_adjusted_score: int
    breakdown: ScoreBreakdown
    critical_gaps: List[str]
    optimization_priority: List[str]
    feedback_detailed: List[FeedbackItem]
    predicted_outcome: str  # "Likely Interview", "Possible Review", "Auto-Reject"
    confidence_level: int

class EnterpriseATSResponse(BaseModel):
    ATSScore: float
    SkillMatchScore: float
    ExperienceScore: float
    ReadabilityScore: float
    AchievementScore: float
    Suggestions: List[str]
