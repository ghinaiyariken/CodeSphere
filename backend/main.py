from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.parser import extract_text
from services.scorer import calculate_similarity
import shutil
import os
import tempfile

app = FastAPI()

# CORS Configuration
# Allow all for development simplicity
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Smart Resume Builder API is running"}

@app.on_event("startup")
async def startup_event():
    print("Items registered:")
    for route in app.routes:
        print(f"Route: {route.path} {route.methods}")

@app.post("/api/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(None),
    jd_file: UploadFile = File(None)
):
    try:
        # 1. Handle Resume File
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_resume:
            shutil.copyfileobj(file.file, temp_resume)
            resume_path = temp_resume.name
        
        resume_text = extract_text(resume_path, file.content_type)
        os.unlink(resume_path)
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from resume.")

        # 2. Handle Job Description (File or Text)
        jd_text = job_description
        if jd_file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{jd_file.filename.split('.')[-1]}") as temp_jd:
                shutil.copyfileobj(jd_file.file, temp_jd)
                jd_path = temp_jd.name
            
            jd_text = extract_text(jd_path, jd_file.content_type)
            os.unlink(jd_path)
            
        if not jd_text or len(jd_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Please provide a valid job description (text or file).")
            
        # 3. Analyze
        result = calculate_similarity(resume_text, jd_text)
        
        return {
            "success": True,
            "data": result,
            "resume_text_preview": resume_text[:200] + "..."
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from services.generator import generate_cover_letter

@app.post("/api/generate-cover-letter")
async def create_cover_letter(
    resume_text: str = Form(None),
    job_description: str = Form(None),
    resume_file: UploadFile = File(None),
    jd_file: UploadFile = File(None)
):
    try:
        # 1. Handle Resume
        final_resume_text = resume_text
        if resume_file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{resume_file.filename.split('.')[-1]}") as temp_resume:
                shutil.copyfileobj(resume_file.file, temp_resume)
                resume_path = temp_resume.name
            final_resume_text = extract_text(resume_path, resume_file.content_type)
            os.unlink(resume_path)

        # 2. Handle Job Description
        final_jd_text = job_description
        if jd_file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{jd_file.filename.split('.')[-1]}") as temp_jd:
                shutil.copyfileobj(jd_file.file, temp_jd)
                jd_path = temp_jd.name
            final_jd_text = extract_text(jd_path, jd_file.content_type)
            os.unlink(jd_path)
            
        if not final_resume_text or not final_jd_text:
            raise HTTPException(status_code=400, detail="Missing resume content or job description")
            
        # We don't have matched keywords here unless we analyze first, 
        # but the generator can work with text. We'll pass empty list for now
        # or we could quickly analyze it here.
        result = calculate_similarity(final_resume_text, final_jd_text)
        matched_keywords = result.get("matched_keywords", [])

        letter = generate_cover_letter(final_resume_text, final_jd_text, matched_keywords)
        
        return {
            "success": True,
            "cover_letter": letter
        }
    except Exception as e:
        print(f"Error generating letter: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
