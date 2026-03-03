import requests
import os

def test_ats_backend():
    base_url = "http://localhost:8000"
    
    # Check if server is up
    try:
        resp = requests.get(f"{base_url}/")
        print(f"Server Status: {resp.json()}")
    except:
        print("Server not running. Start it first with 'python main.py' in the backend directory.")
        return

    # Mock resume and JD
    resume_text = """
    John Doe
    Software Engineer with 5 years of experience in Python and React.
    Developed scalable web applications using FastAPI and Node.js.
    Increased system performance by 30% through database optimization.
    Education: B.S. in Computer Science.
    Skills: Python, JavaScript, React, SQL, AWS.
    """
    
    jd_text = """
    We are looking for a Senior Software Engineer with 5+ years of experience.
    Strong skills in Python, React, and AWS are required.
    Experience with database optimization and system performance is a plus.
    """
    
    # 1. Test /uploadResume
    # Create a temp file
    with open("temp_resume.txt", "w") as f:
        f.write(resume_text)
    
    with open("temp_resume.txt", "rb") as f:
        resp = requests.post(f"{base_url}/uploadResume", files={"file": ("resume.txt", f, "text/plain")})
        resume_id = resp.json().get("resume_id")
        print(f"Upload Resume: {resp.status_code}, ID: {resume_id}")

    # 2. Test /uploadJobDescription
    resp = requests.post(f"{base_url}/uploadJobDescription", data={"job_description": jd_text})
    jd_id = resp.json().get("jd_id")
    print(f"Upload JD: {resp.status_code}, ID: {jd_id}")

    # 3. Test /generateATSScore
    payload = {
        "resume_id": resume_id,
        "jd_id": jd_id
    }
    resp = requests.post(f"{base_url}/generateATSScore", json=payload)
    print(f"Generate Score: {resp.status_code}")
    if resp.status_code == 200:
        print(resp.json())
    else:
        print(resp.text)

    # Cleanup
    os.remove("temp_resume.txt")

if __name__ == "__main__":
    test_ats_backend()
