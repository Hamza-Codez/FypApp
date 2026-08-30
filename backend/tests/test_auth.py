import pytest
from httpx import AsyncClient
from database import users_collection

async def test_register_hr(async_client: AsyncClient):
    response = await async_client.post(
        "/api/auth/signup/hr",
        data={
            "first_name": "New",
            "last_name": "HR",
            "email": "newhr@example.com",
            "username": "newhr",
            "gender": "Other",
            "age": 30,
            "password": "strongpassword123",
            "confirm_password": "strongpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "HR"

async def test_login_hr(async_client: AsyncClient, hr_user):
    response = await async_client.post(
        "/api/auth/login",
        data={
            "username": hr_user["email"],
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

async def test_create_employee(hr_client: AsyncClient):
    response = await hr_client.post(
        "/api/users/employee",
        json={
            "first_name": "New",
            "last_name": "Employee",
            "email": "newemp@example.com",
            "password": "emp_password123",
            "role": "EMPLOYEE"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "newemp@example.com"
    assert data["user"]["role"] == "EMPLOYEE"

async def test_employee_cannot_create_employee(employee_client: AsyncClient):
    response = await employee_client.post(
        "/api/users/employee",
        json={
            "first_name": "Another",
            "last_name": "Employee",
            "email": "anotheremp@example.com",
            "password": "password123",
            "role": "EMPLOYEE"
        }
    )
    # The endpoint requires get_current_hr_user, so it should return 403 Forbidden or 401 Unauthorized
    assert response.status_code in [401, 403]
