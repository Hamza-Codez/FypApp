import pytest
from httpx import AsyncClient

@pytest.fixture
async def project_id(hr_client: AsyncClient, employee_user):
    res = await hr_client.post(
        "/api/projects/",
        json={
            "name": "Task Test Project",
            "description": "test",
            "assigned_to": [employee_user["id"]],
            "team_lead_id": employee_user["id"]
        }
    )
    return res.json()["id"]

async def test_task_workload_limit_exceeded(hr_client: AsyncClient, employee_user, project_id):
    # Create 10 tasks first
    for i in range(10):
        res = await hr_client.post(
            f"/api/projects/{project_id}/tasks",
            json={
                "title": f"Task {i}",
                "description": "test",
                "assigned_to": [employee_user["id"]],
                "priority": "MEDIUM"
            }
        )
        assert res.status_code == 200
        
    # The 11th task should fail with a workload limit error
    res_fail = await hr_client.post(
        f"/api/projects/{project_id}/tasks",
        json={
            "title": "Task 11",
            "description": "test",
            "assigned_to": [employee_user["id"]],
            "priority": "MEDIUM"
        }
    )
    assert res_fail.status_code == 400
    assert "exceeds maximum task workload" in res_fail.json()["detail"].lower()

async def test_task_status_transition_rules(hr_client: AsyncClient, employee_user, project_id):
    # Create a task
    res = await hr_client.post(
        f"/api/projects/{project_id}/tasks",
        json={
            "title": "State Machine Task",
            "description": "test",
            "assigned_to": [employee_user["id"]],
            "priority": "MEDIUM"
        }
    )
    task_id = res.json()["id"]
    
    # Try transitioning TODO -> COMPLETED directly (should fail)
    res_fail = await hr_client.put(
        f"/api/projects/tasks/{task_id}/status",
        json={
            "status": "COMPLETED"
        }
    )
    assert res_fail.status_code == 400
    assert "must be in_progress" in res_fail.json()["detail"].lower()
    
    # Transition TODO -> IN_PROGRESS (should succeed)
    res_prog = await hr_client.put(
        f"/api/projects/tasks/{task_id}/status",
        json={
            "status": "IN_PROGRESS"
        }
    )
    assert res_prog.status_code == 200
    
    # Transition IN_PROGRESS -> COMPLETED (should succeed)
    res_comp = await hr_client.put(
        f"/api/projects/tasks/{task_id}/status",
        json={
            "status": "COMPLETED"
        }
    )
    assert res_comp.status_code == 200

async def test_employee_cannot_mark_completed(employee_client: AsyncClient, hr_client: AsyncClient, employee_user, project_id):
    # Create task as HR
    res = await hr_client.post(
        f"/api/projects/{project_id}/tasks",
        json={
            "title": "Employee Completion Task",
            "description": "test",
            "assigned_to": [employee_user["id"]],
            "status": "IN_PROGRESS"
        }
    )
    task_id = res.json()["id"]
    
    # Employee tries to mark COMPLETED
    res_fail = await employee_client.put(
        f"/api/projects/tasks/{task_id}/status",
        json={
            "status": "COMPLETED"
        }
    )
    # The endpoint should block the employee
    assert res_fail.status_code in [400, 403]
