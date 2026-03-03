import os
import re
from typing import Optional, List, Dict
import pdfminer.high_level
import docx
from .models import ParsedResume, ExperienceItem, EducationItem, ResumeSection

# Regex patterns
EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_REGEX = r'(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}'
YEAR_REGEX = r'\b(19|20)\d{2}\b'

# Section Headers
SECTIONS = {
    "experience": ["experience", "work history", "employment", "professional experience", "work experience"],
    "education": ["education", "academic background", "qualifications", "university", "college"],
    "skills": ["skills", "technical skills", "competencies", "technologies", "core competencies"],
    "projects": ["projects", "personal projects", "academic projects", "portfolio"],
    "summary": ["summary", "profile", "professional summary", "about me", "objective"]
}

# Load NLP model
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = None

def extract_text(file_path: str, content_type: str) -> Optional[str]:
    """
    Extracts text from a file with enhanced error handling and logging.
    """
    print(f"DEBUG: Extracting text from {file_path} (Type: {content_type})")
    try:
        text = None
        # Check based on extension primarily as it's more reliable than browser content_type
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == ".pdf" or content_type == "application/pdf":
            text = extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"] or "wordprocessingml" in content_type:
            text = extract_text_from_docx(file_path)
        elif ext == ".txt" or content_type == "text/plain":
            text = extract_text_from_txt(file_path)
        
        if text:
            clean_text = text.strip()
            print(f"DEBUG: Successfully extracted {len(clean_text)} characters.")
            return clean_text
        
        print(f"DEBUG: Extraction returned empty text for {file_path}")
        return None
            
    except Exception as e:
        print(f"DEBUG: Error during extraction: {str(e)}")
        return None

def extract_text_from_pdf(file_path: str) -> str:
    try:
        # 1. Try standard text extraction first (fastest)
        text = pdfminer.high_level.extract_text(file_path)
        
        # If we got substantial text, return it
        if text and len(text.strip()) > 50:
            return text
        
        # 2. Fallback to OCR if text is empty or very short (likely a scanned image/photo)
        print(f"DEBUG: pdfminer returned '{len(text.strip()) if text else 0}' chars. Attempting OCR fallback...")
        
        try:
            from pdf2image import convert_from_path
            import pytesseract
            from PIL import Image
            
            # Convert PDF pages to images (300 DPI for high accuracy)
            images = convert_from_path(file_path, dpi=300)
            
            ocr_text = ""
            for i, image in enumerate(images):
                print(f"DEBUG: Running OCR on page {i+1}...")
                page_text = pytesseract.image_to_string(image)
                ocr_text += page_text + "\n"
                
            if ocr_text and len(ocr_text.strip()) > 10:
                print(f"DEBUG: OCR successfully extracted {len(ocr_text.strip())} characters.")
                return ocr_text
            
            return text or "" # Return whatever we had if OCR also failed
            
        except ImportError:
            print("DEBUG: OCR libraries (pytesseract/pdf2image) not found. Skipping OCR fallback.")
            return text or ""
        except Exception as ocr_err:
            print(f"DEBUG: OCR process failed: {ocr_err}")
            return text or ""
            
    except Exception as e:
        print(f"DEBUG: PDF Extraction error: {e}")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def extract_text_from_txt(file_path: str) -> str:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def parse_resume(text: str) -> ParsedResume:
    """
    Parses raw resume text into a structured ParsedResume object.
    Segments text into Experience, Education, Skills, etc.
    """
    parsed = ParsedResume(full_text=text)
    
    # 1. Basic Info
    parsed.contact_info = _extract_contact_info(text)
    parsed.word_count = len(text.split())
    
    # 2. Section Segmentation
    sections = _segment_sections(text)
    parsed.sections_present = list(sections.keys())

    # 2.5 NER for Entities
    if nlp:
        doc = nlp(text[:10000]) # Limit to 10k chars for performance
        orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
        # Basic example of using NER results
        if orgs:
            parsed.contact_info["possible_orgs"] = ", ".join(list(set(orgs))[:5])
    
    # 3. Populate Sections
    if "summary" in sections:
        parsed.summary = sections["summary"]
    
    # 4. Skills & Tools Extraction
    all_skills = []
    if "skills" in sections:
        all_skills = [s.strip() for s in re.split(r'[,|•\n\t]', sections["skills"]) if s.strip()]
    
    # Cross-reference with knowledge base to find tools and tech even if not in skills section
    from .knowledge_base import SKILL_CATEGORIES
    detected_tools = []
    text_lower = text.lower()
    for cat, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            if re.search(rf'\b{re.escape(skill)}\b', text_lower):
                detected_tools.append(skill)
                if skill not in all_skills:
                    all_skills.append(skill)
    
    parsed.skills = list(set(all_skills))
    parsed.tools_and_technologies = list(set(detected_tools))
    
    # 5. Experience
    if "experience" in sections:
        parsed.experience = _parse_experience(sections["experience"])
        parsed.total_experience_years = sum(exp.years for exp in parsed.experience)
        
    # 6. Education
    if "education" in sections:
        parsed.education = _parse_education(sections["education"])
        
    # 7. Projects
    if "projects" in sections:
        parsed.projects = [ResumeSection(text=sections["projects"])]
        
    # 8. Certifications
    cert_keywords = ["certified", "certification", "certificate", "aws certified", "pmp", "comptia"]
    detected_certs = []
    for line in text.split('\n'):
        if any(kw in line.lower() for kw in cert_keywords) and len(line) < 100:
            detected_certs.append(line.strip())
    parsed.certifications = list(set(detected_certs))

    # 9. Readability Metrics
    parsed.readability_metrics = {
        "has_tables": "<table>" in text or "</td>" in text, # Simple check
        "bullet_points": len(re.findall(r'[•\-*]\s+', text)),
        "headers_standard": all(h in parsed.sections_present for h in ["experience", "education", "skills"])
    }
        
    return parsed

def _extract_contact_info(text: str) -> Dict[str, str]:
    info = {}
    email_match = re.search(EMAIL_REGEX, text)
    if email_match:
        info["email"] = email_match.group(0)
        
    phone_match = re.search(PHONE_REGEX, text)
    if phone_match:
        info["phone"] = phone_match.group(0)
        
    return info

def _segment_sections(text: str) -> Dict[str, str]:
    """
    Splits the text into sections based on headers.
    """
    lines = text.split('\n')
    sections = {}
    current_section = "uncategorized"
    sections[current_section] = []
    
    for line in lines:
        clean_line = line.strip().lower()
        if not clean_line: continue
        
        # Check if line is a header
        is_header = False
        for section_name, headers in SECTIONS.items():
            if any(h == clean_line or clean_line.startswith(h + ":") or clean_line.startswith(h + " ") for h in headers) and len(clean_line) < 35:
                 current_section = section_name
                 if current_section not in sections:
                    sections[current_section] = []
                 is_header = True
                 break
        
        if not is_header:
            sections[current_section].append(line)
            
    return {k: '\n'.join(v).strip() for k, v in sections.items() if v}

def _parse_experience(text: str) -> List[ExperienceItem]:
    """
    Extract experience items with years.
    """
    items = []
    import datetime
    current_year = datetime.datetime.now().year
    
    # Split by common experience delimiters if we find multiple
    # For simplicity, we treat the whole section as one major item and then try to divide if clear breaks exist
    # Here we'll do a simple split by common patterns like "Company Name" or "Date Range"
    
    years_found = re.findall(YEAR_REGEX, text)
    int_years = sorted([int(y) for y in years_found if 1970 <= int(y) <= current_year + 1])
    
    total_years = 0.0
    if len(int_years) >= 2:
        total_years = float(max(int_years) - min(int_years))
    elif len(int_years) == 1:
        total_years = 1.0 # Minimum credit for having a year listed
        
    # Cap total years at something reasonable to avoid "Graduated 1980" logic
    total_years = min(30.0, total_years)

    lines = text.split('\n')
    title = ""
    for line in lines[:3]:
        if len(line.split()) < 6 and any(word in line.lower() for word in ["engineer", "developer", "manager", "lead", "architect", "analyst"]):
            title = line.strip()
            break
    
    items.append(ExperienceItem(
        title=title or "Professional Experience",
        company="Various",
        duration="Dates in text",
        description=text,
        years=total_years
    ))
    
    return items

def _parse_education(text: str) -> List[EducationItem]:
    items = []
    degrees = ["B.S.", "Bachelor", "M.S.", "Master", "Ph.D.", "Doctorate", "B.A.", "M.A.", "B.Tech", "M.Tech", "Degree"]
    
    lines = text.split('\n')
    for line in lines:
        for degree in degrees:
            if degree.lower() in line.lower():
                year_match = re.search(YEAR_REGEX, line)
                items.append(EducationItem(
                    degree=degree,
                    institution=line.strip(),
                    year=year_match.group(0) if year_match else None
                ))
    return items
