import os
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport

# Set up test database before importing from backend
os.environ["DATABASE_NAME"] = "fyp_app_test"

from main import app
from database import (
    client, 
    database, 
    users_collection, 
    projects_collection, 
    tasks_collection,
    ai_analysis_collection,
    notifications_collection,
    audit_log_collection
)
from utils import create_access_token, get_password_hash

# Set the event loop policy to avoid issues on Windows
if os.name == 'nt':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
async def clean_db():
    """Clean the test database before each test"""
    # Verify we are on the test db
    assert database.name == "fyp_app_test"
    
    await users_collection.delete_many({})
    await projects_collection.delete_many({})
    await tasks_collection.delete_many({})
    await ai_analysis_collection.delete_many({})
    await notifications_collection.delete_many({})
    await audit_log_collection.delete_many({})
    yield

@pytest.fixture(scope="session")
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def hr_user():
    user_data = {
        "email": "hr_test@example.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "first_name": "Test",
        "last_name": "HR",
        "organization_name": "Test Org",
        "status": "ACTIVE"
    }
    result = await users_collection.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    user_data["id"] = str(result.inserted_id)
    return user_data

@pytest.fixture
async def hr_token(hr_user):
    return create_access_token(data={"sub": hr_user["email"]})

@pytest.fixture
async def hr_client(async_client, hr_token):
    async_client.headers.update({"Authorization": f"Bearer {hr_token}"})
    return async_client

@pytest.fixture
async def employee_user(hr_user):
    user_data = {
        "email": "emp_test@example.com",
        "password": get_password_hash("password123"),
        "role": "EMPLOYEE",
        "first_name": "Test",
        "last_name": "Employee",
        "organization_name": "Test Org",
        "created_by": hr_user["id"],
        "status": "ACTIVE"
    }
    result = await users_collection.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    user_data["id"] = str(result.inserted_id)
    return user_data

@pytest.fixture
async def employee_token(employee_user):
    return create_access_token(data={"sub": employee_user["email"]})

@pytest.fixture
async def employee_client(async_client, employee_token):
    async_client.headers.update({"Authorization": f"Bearer {employee_token}"})
    return async_client
