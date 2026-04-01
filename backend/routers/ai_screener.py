from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
import os
import io
import json
from groq import Groq
from deps import get_current_hr_user
from models import AIScreenerResponse, AIScreenerResult
from dotenv import load_dotenv

# Optional PDF/DOCX dependencies
fitz = None
fitz_import_error = None
try:
    import fitz  # PyMuPDF
except Exception as e:
    fitz_import_error = str(e)

Document = None
docx_import_error = None
try:
    from docx import Document
except Exception as e:
    docx_import_error = str(e)

load_dotenv()

router = APIRouter()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY"))

def extract_text_from_pdf(file_content: bytes) -> str:
    text = ""
    with fitz.open(stream=file_content, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def extract_text_from_docx(file_content: bytes) -> str:
    doc = Document(io.BytesIO(file_content))
    return "\n".join([para.text for para in doc.paragraphs])

@router.post("/analyze", response_model=AIScreenerResponse)
async def analyze_cvs(
    requirements: str = Form(...),
    files: List[UploadFile] = File(...),
    current_hr: dict = Depends(get_current_hr_user)
):
    results = []
    
    for file in files:
        content = await file.read()
        filename = file.filename
        cv_text = ""
        
        try:
            if filename.lower().endswith('.pdf'):
                if fitz is None:
                    raise HTTPException(
                        status_code=503,
                        detail=f"PDF parsing not available: {fitz_import_error or 'pymupdf not installed'}"
                    )
                cv_text = extract_text_from_pdf(content)
            elif filename.lower().endswith('.docx'):
                if Document is None:
                    raise HTTPException(
                        status_code=503,
                        detail=f"DOCX parsing not available: {docx_import_error or 'python-docx not installed'}"
                    )
                cv_text = extract_text_from_docx(content)
            else:
                cv_text = content.decode('utf-8', errors='ignore')
            
            print(f"Extracted {len(cv_text)} characters from {filename}")
        except Exception as e:
            print(f"Text Extraction Error for {filename}: {str(e)}")
            continue # Skip failed files
            
        # Call Groq AI
        try:
            # Clean CV text and requirements for better processing
            cv_text_clean = cv_text.strip()
            if not cv_text_clean:
                raise ValueError("No text could be extracted from CV")

            prompt = f"""
            You are an expert HR Recruiter. 
            Analyze the following CV against the provided Job Requirements.
            
            Job Requirements:
            {requirements}
            
            CV Content:
            {cv_text_clean[:10000]}
            
            Provide a JSON response with the following structure:
            {{
                "candidate_name": "Extract Name from CV",
                "score": 0-100,
                "summary": "Short 2 sentence summary of candidate background",
                "strengths": ["list of top 3 strengths"],
                "weaknesses": ["list of top 3 missing requirements"],
                "verdict": "Short hiring recommendation"
            }}
            Return ONLY the raw JSON.
            """
            
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a helpful HR assistant that returns only structured JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            analysis = json.loads(completion.choices[0].message.content)
            
            # Save to MongoDB
            from database import ai_analysis_collection
            from datetime import datetime
            
            analysis_record = {
                **analysis,
                "hr_id": current_hr["id"],
                "job_requirements": requirements,
                "filename": filename,
                "created_at": datetime.utcnow()
            }
            await ai_analysis_collection.insert_one(analysis_record)
            
            results.append(AIScreenerResult(**analysis))
            
        except Exception as e:
            print(f"AI Error: {str(e)}")
            results.append(AIScreenerResult(
                candidate_name=filename,
                score=0,
                summary="Failed to analyze this CV due to AI error.",
                strengths=[],
                weaknesses=["Error processing file"],
                verdict="REJECT"
            ))
            
    return AIScreenerResponse(results=results)

