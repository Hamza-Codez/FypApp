from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
import os
import io
import json
from datetime import datetime
# pyrefly: ignore [missing-import]
from groq import Groq
from bson import ObjectId
from pydantic import BaseModel
from dotenv import load_dotenv
from database import ai_analysis_collection, log_audit
from deps import get_current_hr_user
from models import AIScreenerResponse, AIScreenerResult

# Optional PDF/DOCX dependencies
pypdf = None
pypdf_import_error = None
try:
    # pyrefly: ignore [missing-import]
    import pypdf
except Exception as e:
    pypdf_import_error = str(e)

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
    reader = pypdf.PdfReader(io.BytesIO(file_content))
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
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
    if not requirements.strip() or len(requirements.strip()) < 10:
        raise HTTPException(status_code=400, detail="Job requirements cannot be empty or too short")

    results = []
    any_truncated = False
    
    for file in files:
        content = await file.read()
        filename = file.filename
        cv_text = ""
        
        try:
            if filename.lower().endswith('.pdf'):
                if pypdf is None:
                    raise HTTPException(
                        status_code=503,
                        detail=f"PDF parsing not available: {pypdf_import_error or 'pypdf not installed'}"
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
            
            # Text extracted successfully
        except Exception as e:
            results.append(AIScreenerResult(
                candidate_name=filename,
                score=0,
                summary=f"Failed to read file: {str(e)}",
                strengths=[],
                weaknesses=["File could not be parsed"],
                verdict="ERROR"
            ))
            continue # Skip AI processing for this file
            
        # Call Groq AI
        try:
            cv_text_clean = cv_text.strip()
            if not cv_text_clean:
                raise ValueError("No text could be extracted from CV")

            was_truncated = len(cv_text_clean) > 10000
            if was_truncated:
                any_truncated = True

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
                model="openai/gpt-oss-120b",
                messages=[
                    {"role": "system", "content": "You are a helpful HR assistant that returns only structured JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            analysis = json.loads(completion.choices[0].message.content)
            
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
            results.append(AIScreenerResult(
                candidate_name=filename,
                score=0,
                summary=f"Failed to analyze this CV: {str(e)}",
                strengths=[],
                weaknesses=["Error processing file"],
                verdict="REJECT"
            ))
            
    return AIScreenerResponse(results=results, truncated=any_truncated)

def analysis_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "candidate_name": doc.get("candidate_name"),
        "score": doc.get("score"),
        "summary": doc.get("summary"),
        "strengths": doc.get("strengths", []),
        "weaknesses": doc.get("weaknesses", []),
        "verdict": doc.get("verdict"),
        "hr_id": doc.get("hr_id"),
        "job_requirements": doc.get("job_requirements"),
        "filename": doc.get("filename"),
        "status": doc.get("status", "PENDING"),
        "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None
    }

@router.get("/recent")
async def get_recent_analyses(current_hr: dict = Depends(get_current_hr_user)):
    cursor = ai_analysis_collection.find({"hr_id": current_hr["id"]}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [analysis_helper(d) for d in docs]

class DeleteAnalysesRequest(BaseModel):
    ids: List[str]

@router.post("/delete")
async def delete_analyses(
    req: DeleteAnalysesRequest,
    current_hr: dict = Depends(get_current_hr_user)
):
    try:
        object_ids = [ObjectId(i) for i in req.ids]
        result = await ai_analysis_collection.delete_many({
            "_id": {"$in": object_ids},
            "hr_id": current_hr["id"]
        })
        return {"message": f"Successfully deleted {result.deleted_count} record(s)"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload or ID: {str(e)}")

class AIActionRequest(BaseModel):
    action: str

@router.post("/action/{analysis_id}")
async def post_screening_action(
    analysis_id: str,
    action_req: AIActionRequest,
    current_hr: dict = Depends(get_current_hr_user)
):
    analysis = await ai_analysis_collection.find_one({"_id": ObjectId(analysis_id), "hr_id": current_hr["id"]})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found")
        
    action = action_req.action.upper()
    if action not in ["SHORTLIST", "REJECT", "ONBOARD"]:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    await ai_analysis_collection.update_one(
        {"_id": ObjectId(analysis_id)},
        {"$set": {"status": action}}
    )
    
    await log_audit(current_hr["id"], "AI_SCREENING_ACTION", "AI_ANALYSIS", analysis_id, {"action": action})
    
    return {"message": f"Candidate marked as {action}", "status": action}

