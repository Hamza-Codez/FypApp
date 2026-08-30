import pytest
from httpx import AsyncClient

async def test_create_project_success(hr_client: AsyncClient, employee_user):
    response = await hr_client.post(
        "/api/projects/",
        json={
            "name": "Test Project 1",
            "description": "A new test project",
            "assigned_to": [employee_user["id"]],
            "team_lead_id": employee_user["id"],
            "status": "PLANNING",
            "priority": "HIGH"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Project 1"

async def test_project_workload_limit_exceeded(hr_client: AsyncClient, employee_user):
    # Create 5 projects first
    for i in range(5):
        res = await hr_client.post(
            "/api/projects/",
            json={
                "name": f"Project {i}",
                "description": "test",
                "assigned_to": [employee_user["id"]],
                "team_lead_id": employee_user["id"]
            }
        )
        assert res.status_code == 200
        
    # The 6th project should fail with a workload limit error
    response = await hr_client.post(
        "/api/projects/",
        json={
            "name": "Project 6",
            "description": "test",
            "assigned_to": [employee_user["id"]],
            "team_lead_id": employee_user["id"]
        }
    )
    assert response.status_code == 400
    assert "exceeds maximum project workload" in response.json()["detail"].lower()

async def test_project_completion_prevented_with_active_tasks(hr_client: AsyncClient, employee_user):
    # Create a project
    res1 = await hr_client.post(
        "/api/projects/",
        json={
            "name": "Completion Test",
            "description": "test",
            "assigned_to": [employee_user["id"]],
            "team_lead_id": employee_user["id"]
        }
    )
    project_id = res1.json()["id"]
    
    # Create an active task
    res2 = await hr_client.post(
        f"/api/projects/{project_id}/tasks",
        json={
            "title": "Pending Task",
            "description": "Must do",
            "assigned_to": [employee_user["id"]],
            "status": "TODO",
            "priority": "HIGH"
        }
    )
    assert res2.status_code == 200
    
    # Try to mark project as COMPLETED
    res3 = await hr_client.put(
        f"/api/projects/{project_id}",
        json={
            "status": "COMPLETED"
        }
    )
    # Should fail because there is a TODO task
    assert res3.status_code == 400
    assert "all tasks must be completed" in res3.json()["detail"].lower()
