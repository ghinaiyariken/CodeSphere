from services.enterprise_scorer import EnterpriseScorer
from services.parser import parse_resume

def debug_scorer():
    scorer = EnterpriseScorer()
    
    resume_text = """
    John Doe
    Software Engineer with 10 years of experience in Python, Java, and AWS.
    Built enterprise applications using Microservices architecture.
    Optimized database queries reducing latency by 40%.
    Managed a team of 5 engineers.
    Skills: Python, Java, AWS, Docker, Kubernetes, SQL.
    """
    
    jd_text = """
    Senior Software Engineer
    Requirements:
    - 5+ years of experience in Python and AWS.
    - Experience with Docker and Kubernetes.
    - Strong understanding of SQL and query optimization.
    - Leadership experience is a plus.
    """
    
    print("--- Starting Analysis ---")
    result = scorer.get_full_analysis(resume_text, jd_text)
    print("Full Result Object:")
    import json
    print(json.dumps(result, indent=2))
    
    # Test with very short text
    print("\n--- Testing with short text ---")
    short_result = scorer.get_full_analysis("Hello", "Job")
    print(json.dumps(short_result, indent=2))

if __name__ == "__main__":
    debug_scorer()
