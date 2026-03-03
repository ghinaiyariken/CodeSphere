import spacy
import re
from typing import Set
from .knowledge_base import SKILL_CATEGORIES, SKILL_SYNONYMS

# Load NLP model globally for reuse
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Attempt download if missing
    try:
        import subprocess
        import sys
        subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        nlp = spacy.load("en_core_web_sm")
    except:
        nlp = None

def extract_keywords_util(text: str) -> Set[str]:
    """
    Refined Keyword Extraction. 
    Focuses on industry skills and filters out generic corporate 'noise'.
    """
    if not text:
        return set()
        
    text_lower = text.lower()
    keywords = set()
    
    # Generic corporate words to ignore (Noise Filter)
    NOISE_WORDS = {
        "experience", "process", "details", "application", "system", "management", 
        "requirements", "responsibilities", "knowledge", "skills", "ability",
        "professional", "teams", "projects", "work", "field", "standard", "working",
        "description", "position", "career", "role", "highly", "successful", "candidate",
        "years", "degree", "environment", "support", "development", "production", "tools"
    }
    
    # 1. Knowledge Base Scan (High Priority - Industry Skills)
    for category, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            skill_low = skill.lower()
            # Strict word boundary check for short skills like 'go'
            pattern = rf'\b{re.escape(skill_low)}\b'
            if re.search(pattern, text_lower):
                keywords.add(skill)
                continue
                
            for syn, canonical in SKILL_SYNONYMS.items():
                if canonical == skill:
                    if re.search(rf'\b{re.escape(syn.lower())}\b', text_lower):
                        keywords.add(skill)
                        break
    
    # 2. NLP extraction (Low Priority - only if not in noise and looks like a specific tool/propn)
    if nlp:
        doc = nlp(text_lower[:50000])
        for token in doc:
            # Only take nouns that are NOT noise and are long enough
            if (token.pos_ in ["NOUN", "PROPN"] and 
                not token.is_stop and 
                len(token.text) > 3 and 
                token.text not in NOISE_WORDS):
                
                # If it's a Proper Noun (PROPN), it's likely a specific tool/company
                if token.pos_ == "PROPN":
                    keywords.add(token.text.capitalize())
                # Only add nouns if we don't have enough keywords yet
                elif len(keywords) < 20: 
                    keywords.add(token.text.capitalize())
                        
    return keywords
