from typing import Dict, List
import re

def generate_cover_letter(resume_text: str, jd_text: str, matched_skills: List[str]) -> str:
    """
    Generates a cover letter based on the provided resume and JD.
    Uses a template-based approach with slot filling.
    """
    
    # 1. Extract Basic Info (Heuristic based)
    # Try to find a name in the first few lines of resume
    lines = resume_text.split('\n')
    candidate_name = "[Your Name]"
    for line in lines[:5]:
        if len(line.strip()) > 3 and len(line.split()) < 4:
             # Assume potential name if short line at top
            candidate_name = line.strip().title()
            break
            
    # Try to find Company Name in JD (Look for "at [Company]" or "About [Company]")
    company_name = "[Company Name]"
    company_match = re.search(r"(?:at|join|about)\s+([A-Z][a-zA-Z0-9\s\&,.]+?)(?:\s+is|\s+looking|\.|,)", jd_text)
    if company_match:
        found_name = company_match.group(1).strip()
        if len(found_name) < 30: # Sanity check
            company_name = found_name

    # Try to find Job Title
    job_title = "Role"
    title_match = re.search(r"(?:looking for a|position:|vacancy for)\s+([A-Z][a-zA-Z\s]+)", jd_text, re.IGNORECASE)
    if title_match:
        job_title = title_match.group(1).strip()

    # 2. Format Skills
    # Use top 3 matched skills or generic ones if none
    top_skills = matched_skills[:3]
    if not top_skills:
        skill_text = "my diverse technical skillset"
    elif len(top_skills) == 1:
        skill_text = f"my expertise in {top_skills[0]}"
    else:
        skill_text = f"my strong background in {', '.join(top_skills[:-1])} and {top_skills[-1]}"

    # 3. Select Template (Professional Standard)
    template = f"""
{candidate_name}
[Your Phone Number] | [Your Email]
[City, State]

Date: [Today's Date]

Hiring Manager
{company_name}

Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company_name}. With my background in software development and {skill_text}, I am confident in my ability to contribute effectively to your team.

Analyzing your job description, I see you are looking for someone proficient in key technologies. My experience aligns well with these requirements, particularly in my ability to deliver robust solutions.

I am eager to bring my problem-solving skills and technical expertise to {company_name}. Thank you for considering my application. I look forward to the possibility of discussing how I can contribute to your projects.

Sincerely,

{candidate_name}
"""
    return template.strip()
