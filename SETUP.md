# Project Setup and Run Guide

This document contains the necessary steps to set up and run the full-stack project (FypApp) locally. The project consists of a React/Vite frontend and a FastAPI backend.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** (v18 or higher recommended) & **npm** (for the frontend)
- **Python** (v3.8 or higher) (for the backend)
- **Git** (optional, for cloning if needed)

## Project Structure

The project is divided into two main directories:
- `/frontend` - Contains the React frontend code (built with Vite).
- `/backend` - Contains the FastAPI backend code.

---

## 1. Backend Setup

The backend is built with Python and FastAPI, and it requires some environment variables to connect to MongoDB, Cloudinary, Email Service, and Groq API.

### Step 1.1: Navigate to the backend directory
Open your terminal and navigate to the backend folder:
```bash
cd backend
```

### Step 1.2: Create a virtual environment (Recommended)
It is highly recommended to use a virtual environment to manage dependencies.
```bash
python -m venv venv
```

Activate the virtual environment:
- **On Windows:**
  ```bash
  venv\Scripts\activate
  ```
- **On macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### Step 1.3: Install backend dependencies
Install the required Python packages using `pip`:
```bash
pip install -r requirements.txt
```

### Step 1.4: Configure Environment Variables
Create a file named `.env` in the `backend` directory (if it doesn't exist already) or just copy the provided `.env.local` to `.env`. 

Your `.env` file should look like this (fill in the required credentials or use the provided ones if testing):

```env
MONGODB_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0"
DATABASE_NAME="office_management_db"
SECRET_KEY="your_secret_key_here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

CLOUDINARY_CLOUD_NAME='your_cloud_name'
CLOUDINARY_API_KEY='your_api_key'
CLOUDINARY_API_SECRET='your_api_secret'

MAIL_USERNAME="your_email@gmail.com"
MAIL_PASSWORD="your_app_password"
MAIL_PORT=587
MAIL_SERVER="smtp.gmail.com"
MAIL_FROM_NAME="Office Management System"

GROQ_API_KEY='your_groq_api_key'
```
*(Note: If testing locally with the provided `.env.local` file, you can rename it to `.env` or run the server with `--env-file .env.local` if your setup supports it).*

### Step 1.5: Run the backend server
Start the FastAPI server using Uvicorn:
```bash
uvicorn main:app --reload
```
The backend server will start running at: **http://localhost:8000**
You can access the interactive API documentation (Swagger UI) at: **http://localhost:8000/docs**

---

## 2. Frontend Setup

The frontend is built using React, Redux, Tailwind CSS, and Vite.

### Step 2.1: Navigate to the frontend directory
Open a **new terminal window/tab** and navigate to the frontend folder:
```bash
cd frontend
```

### Step 2.2: Install frontend dependencies
Install all the required Node.js packages using npm:
```bash
npm install
```

### Step 2.3: Configure Environment Variables
Create a `.env` file in the `frontend` directory. It should contain the base URL for the backend API:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 2.4: Run the frontend development server
Start the Vite development server:
```bash
npm run dev
```
The frontend application will start running and can be accessed in your browser, typically at: **http://localhost:5173** (or whichever port Vite assigns, check the terminal output).

---

## Summary of Commands to Run Daily

Once the initial setup and installations are done, you only need to run these commands to start the project:

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate   # (On Windows)
uvicorn main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
