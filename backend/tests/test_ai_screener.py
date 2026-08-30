import pytest
from httpx import AsyncClient
from database import ai_analysis_collection

@pytest.fixture
async def analysis_record(hr_user):
    # Insert a dummy AI analysis record into the db
    record = {
        "hr_id": hr_user["id"],
        "candidate_name": "John Doe",
        "score": 85,
        "summary": "Great candidate",
        "strengths": ["Python", "React"],
        "weaknesses": ["None"],
        "verdict": "SHORTLIST",
        "job_requirements": "Looking for fullstack",
        "filename": "john_doe_cv.pdf",
        "status": "PENDING"
    }
    result = await ai_analysis_collection.insert_one(record)
    return str(result.inserted_id)

async def test_ai_screener_post_screening_actions(hr_client: AsyncClient, analysis_record):
    # Test valid action: SHORTLIST
    res1 = await hr_client.post(
        f"/api/ai-screener/action/{analysis_record}",
        json={"action": "SHORTLIST"}
    )
    assert res1.status_code == 200
    assert res1.json()["status"] == "SHORTLIST"
    
    # Verify in DB
    from bson import ObjectId
    doc1 = await ai_analysis_collection.find_one({"_id": ObjectId(analysis_record)})
    assert doc1["status"] == "SHORTLIST"
    
    # Test valid action: REJECT
    res2 = await hr_client.post(
        f"/api/ai-screener/action/{analysis_record}",
        json={"action": "REJECT"}
    )
    assert res2.status_code == 200
    assert res2.json()["status"] == "REJECT"

    # Test valid action: ONBOARD
    res3 = await hr_client.post(
        f"/api/ai-screener/action/{analysis_record}",
        json={"action": "ONBOARD"}
    )
    assert res3.status_code == 200
    assert res3.json()["status"] == "ONBOARD"
    
    # Test invalid action
    res_fail = await hr_client.post(
        f"/api/ai-screener/action/{analysis_record}",
        json={"action": "INVALID_ACTION"}
    )
    assert res_fail.status_code == 400
    assert "invalid action" in res_fail.json()["detail"].lower()

async def test_ai_screener_action_unauthorized(employee_client: AsyncClient, analysis_record):
    # Employees shouldn't be able to access AI screener routes
    res = await employee_client.post(
        f"/api/ai-screener/action/{analysis_record}",
        json={"action": "SHORTLIST"}
    )
    assert res.status_code in [401, 403]
