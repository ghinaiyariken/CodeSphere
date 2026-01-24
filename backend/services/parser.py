import os
from typing import Optional
import pdfminer.high_level
import docx

def extract_text(file_path: str, content_type: str) -> Optional[str]:
    """
    Extracts text from a file based on its content type (PDF, DOCX, or TXT).
    """
    try:
        # Check by content type first
        if content_type == "application/pdf":
            return extract_text_from_pdf(file_path)
        elif content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
            return extract_text_from_docx(file_path)
        elif content_type == "text/plain":
            return extract_text_from_txt(file_path)
        
        # Fallback based on extension
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return extract_text_from_docx(file_path)
        elif ext == ".txt":
            return extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {content_type} / {ext}")
            
    except Exception as e:
        print(f"Error parsing file: {e}")
        return None

def extract_text_from_pdf(file_path: str) -> str:
    return pdfminer.high_level.extract_text(file_path)

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def extract_text_from_txt(file_path: str) -> str:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()
