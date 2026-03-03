from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from services.parser import extract_text, parse_resume
from services.enterprise_scorer import EnterpriseScorer
from services.models import EnterpriseATSResponse
import shutil
import os
import tempfile
import uuid
from typing import Dict

app = FastAPI(title="Enterprise ATS Resume Scoring AI")

# CORS Configuration
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo purposes
# In production, this would be Redis or a Database
storage = {
    "resumes": {},
    "jds": {}
}

scorer = EnterpriseScorer()

@app.get("/")
def read_root():
    return {"message": "Enterprise ATS Scoring AI API is running"}

@app.post("/uploadResume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        suffix = f".{file.filename.split('.')[-1]}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_resume:
            shutil.copyfileobj(file.file, temp_resume)
            resume_path = temp_resume.name
        
        resume_text = extract_text(resume_path, file.content_type)
        os.unlink(resume_path)
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from resume.")
            
        resume_id = str(uuid.uuid4())
        storage["resumes"][resume_id] = resume_text
        
        return {"resume_id": resume_id, "message": "Resume uploaded and parsed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/uploadJobDescription")
async def upload_jd(
    job_description: str = Form(None),
    jd_file: UploadFile = File(None)
):
    try:
        jd_text = job_description
        if jd_file:
            suffix = f".{jd_file.filename.split('.')[-1]}"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_jd:
                shutil.copyfileobj(jd_file.file, temp_jd)
                jd_path = temp_jd.name
            
            jd_text = extract_text(jd_path, jd_file.content_type)
            os.unlink(jd_path)
            
        if not jd_text:
            raise HTTPException(status_code=400, detail="No job description provided.")
            
        jd_id = str(uuid.uuid4())
        storage["jds"][jd_id] = jd_text
        
        return {"jd_id": jd_id, "message": "Job description uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generateATSScore", response_model=EnterpriseATSResponse)
async def generate_ats_score(
    resume_id: str = Body(None, embed=True),
    jd_id: str = Body(None, embed=True),
    # Allow direct upload for convenience in a single call scenario if needed, 
    # but primarily using the stored IDs as requested
    resume_text: str = Body(None, embed=True),
    jd_text: str = Body(None, embed=True)
):
    try:
        final_resume_text = resume_text
        if resume_id:
            if resume_id in storage["resumes"]:
                final_resume_text = storage["resumes"][resume_id]
            else:
                raise HTTPException(status_code=404, detail=f"Resume ID {resume_id} not found. The server might have restarted; please re-upload your resume.")
            
        final_jd_text = jd_text
        if jd_id:
            if jd_id in storage["jds"]:
                final_jd_text = storage["jds"][jd_id]
            else:
                raise HTTPException(status_code=404, detail=f"Job Description ID {jd_id} not found. Please re-upload your JD.")
            
        if not final_resume_text or len(final_resume_text.strip()) < 10:
             raise HTTPException(status_code=400, detail="Missing or too short resume content.")
             
        if not final_jd_text or len(final_jd_text.strip()) < 10:
             raise HTTPException(status_code=400, detail="Missing or too short job description.")
             
        print(f"DEBUG: Processing analysis. Resume chars: {len(final_resume_text)}, JD chars: {len(final_jd_text)}")
        result = scorer.get_full_analysis(final_resume_text, final_jd_text)
        print(f"DEBUG: Calculated Score: {result['ATSScore']}")
        return result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error generating score: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Backward compatibility for old frontend
@app.post("/api/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(None),
    jd_file: UploadFile = File(None),
    company_name: str = Form("General")
):
    try:
        # Re-use the new enterprise logic
        suffix = f".{file.filename.split('.')[-1]}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_resume:
            shutil.copyfileobj(file.file, temp_resume)
            resume_path = temp_resume.name
        resume_text = extract_text(resume_path, file.content_type)
        os.unlink(resume_path)
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from resume. Please ensure it is not a scanned image or password protected.")

        jd_text = job_description or ""
        if jd_file:
            suffix = f".{jd_file.filename.split('.')[-1]}"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_jd:
                shutil.copyfileobj(jd_file.file, temp_jd)
                jd_path = temp_jd.name
            jd_text = extract_text(jd_path, jd_file.content_type) or ""
            os.unlink(jd_path)
            
        print(f"DEBUG: Legacy API Analyze called. Resume chars: {len(resume_text)}, JD chars: {len(jd_text)}")
        result = scorer.get_full_analysis(resume_text, jd_text)
        print(f"DEBUG: Analysis complete. Score: {result['ATSScore']}")
        
        # Match the frontend AnalysisResult interface
        return {
            "success": True,
            "data": {
                "score": result["ATSScore"],
                "matched_keywords": result.get("matched_keywords", []),
                "missing_keywords": result.get("missing_keywords", []),
                "total_keywords": result.get("total_keywords", 0),
                "suggestions": result["Suggestions"],
                "parsed_resume": result.get("parsed_resume"),
                "breakdown": {
                    "tier1_foundation": result["SkillMatchScore"],
                    "tier2_qualitative": result["ExperienceScore"],
                    "tier3_optimization": result["ReadabilityScore"],
                    "tier4_advanced": result["AchievementScore"]
                }
            }
        }
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        return {
            "success": False,
            "message": str(e),
            "data": {
                "score": 0,
                "matched_keywords": [],
                "missing_keywords": [],
                "total_keywords": 0,
                "suggestions": [f"Error: {str(e)}"]
            }
        }

from services.generator import generate_cover_letter

@app.post("/api/generate-cover-letter")
async def create_cover_letter(
    resume_text: str = Form(None),
    job_description: str = Form(None),
    resume_file: UploadFile = File(None),
    jd_file: UploadFile = File(None)
):
    # (Kept for existing functionality, updated to use enterprise scorer for keywords)
    try:
        final_resume_text = resume_text
        if resume_file:
            suffix = f".{resume_file.filename.split('.')[-1]}"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_resume:
                shutil.copyfileobj(resume_file.file, temp_resume)
                resume_path = temp_resume.name
            final_resume_text = extract_text(resume_path, resume_file.content_type)
            os.unlink(resume_path)

        final_jd_text = job_description
        if jd_file:
            suffix = f".{jd_file.filename.split('.')[-1]}"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_jd:
                shutil.copyfileobj(jd_file.file, temp_jd)
                jd_path = temp_jd.name
            final_jd_text = extract_text(jd_path, jd_file.content_type)
            os.unlink(jd_path)
            
        if not final_resume_text or not final_jd_text:
            raise HTTPException(status_code=400, detail="Missing resume content or job description")
            
        from services.utils import extract_keywords_util
        matched_keywords = list(extract_keywords_util(final_jd_text).intersection(extract_keywords_util(final_resume_text)))

        letter = generate_cover_letter(final_resume_text, final_jd_text, matched_keywords)
        
        return {
            "success": True,
            "cover_letter": letter
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
