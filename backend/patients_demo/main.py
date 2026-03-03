from fastapi import FastAPI
import json

app = FastAPI()

def load_data():
    
    with open ("patients.json", "r") as f:
        data = json.load(f)
        
    return data

@app.get("/")
def hello():
	return {"message": "Hello"}

@app.get("/view")
def view():
    data = load_data()
    return data

@app.get('/id/{id}')
def get_employee_by_id(id: int):
    data = load_data()
    employees = data.get("employees", [])
    for employee in employees:
        if employee.get("id") == id:
            return employee
    return {"error": "Employee not found"}