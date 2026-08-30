import pytest
from httpx import AsyncClient
from database import settings_collection

async def test_get_workload_settings_defaults(hr_client: AsyncClient):
    response = await hr_client.get("/api/users/workload-settings")
    assert response.status_code == 200
    data = response.json()
    assert data["max_projects_lead"] == 2
    assert data["max_projects_member"] == 5

async def test_update_workload_settings_hr(hr_client: AsyncClient):
    response = await hr_client.put(
        "/api/users/workload-settings",
        json={"max_projects_lead": 3, "max_projects_member": 6}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["max_projects_lead"] == 3
    assert data["max_projects_member"] == 6

    # Verify persistent storage
    get_res = await hr_client.get("/api/users/workload-settings")
    assert get_res.status_code == 200
    assert get_res.json()["max_projects_lead"] == 3
    assert get_res.json()["max_projects_member"] == 6

async def test_employee_cannot_update_settings(employee_client: AsyncClient):
    response = await employee_client.put(
        "/api/users/workload-settings",
        json={"max_projects_lead": 10, "max_projects_member": 20}
    )
    # Only HR can update settings
    assert response.status_code in [400, 403]

async def test_employee_can_fetch_hr_creator_settings(hr_client: AsyncClient, employee_client: AsyncClient):
    # HR sets custom settings
    await hr_client.put(
        "/api/users/workload-settings",
        json={"max_projects_lead": 4, "max_projects_member": 8}
    )

    # Employee fetches settings, which should resolve to their creator's settings
    response = await employee_client.get("/api/users/workload-settings")
    assert response.status_code == 200
    data = response.json()
    assert data["max_projects_lead"] == 4
    assert data["max_projects_member"] == 8

async def test_dynamic_settings_enforcement_lead(hr_client: AsyncClient, employee_user):
    # Set lead limit to 1
    update_res = await hr_client.put(
        "/api/users/workload-settings",
        json={"max_projects_lead": 1, "max_projects_member": 5}
    )
    assert update_res.status_code == 200

    # Create first project led by employee_user
    res1 = await hr_client.post(
        "/api/projects/",
        json={
            "name": "Project Lead 1",
            "description": "First led project",
            "assigned_to": [employee_user["id"]],
            "team_lead_id": employee_user["id"],
            "status": "PLANNING"
        }
    )
    assert res1.status_code == 200

    # Creating second project led by same employee_user should fail because limit is 1
    res2 = await hr_client.post(
        "/api/projects/",
        json={
            "name": "Project Lead 2",
            "description": "Second led project",
            "assigned_to": [employee_user["id"]],
            "team_lead_id": employee_user["id"],
            "status": "PLANNING"
        }
    )
    assert res2.status_code == 400
    assert "already leading 1 active projects and cannot lead more than 1" in res2.json()["detail"]

async def test_dynamic_settings_enforcement_member(hr_client: AsyncClient, employee_user):
    # Set member limit to 1
    update_res = await hr_client.put(
        "/api/users/workload-settings",
        json={"max_projects_lead": 2, "max_projects_member": 1}
    )
    assert update_res.status_code == 200

    # Assign to first project
    res1 = await hr_client.post(
        "/api/projects/",
        json={
            "name": "Project Member 1",
            "description": "First member project",
            "assigned_to": [employee_user["id"]],
            "status": "PLANNING"
        }
    )
    assert res1.status_code == 200

    # Assigning to second project should fail because member limit is 1
    res2 = await hr_client.post(
        "/api/projects/",
        json={
            "name": "Project Member 2",
            "description": "Second member project",
            "assigned_to": [employee_user["id"]],
            "status": "PLANNING"
        }
    )
    assert res2.status_code == 400
    assert "already has 1 active projects and cannot be assigned to more" in res2.json()["detail"]
