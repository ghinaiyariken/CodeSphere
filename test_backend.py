import requests

url = "http://127.0.0.1:8000/api/analyze"
files = {'file': ('test.txt', 'This is a test resume content with Python and React skills.', 'text/plain')}
data = {'job_description': 'We need a developer with Python and React experience.'}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, files=files, data=data)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:", response.json())
except Exception as e:
    print(f"Error: {e}")
