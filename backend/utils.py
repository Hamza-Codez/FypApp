import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
from pydantic import EmailStr

load_dotenv()

# CryptContext for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "secret")
ALGORITHM = os.environ.get("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", "")
)

def upload_image(file_content, folder="office_management"):
    try:
        res = cloudinary.uploader.upload(file_content, folder=folder)
        return res.get("secure_url")
    except Exception as e:
        print("Cloudinary upload error:", e)
        return None

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.environ.get("MAIL_USERNAME", "dummy@gmail.com"),
    MAIL_PASSWORD=os.environ.get("MAIL_PASSWORD", "dummy"),
    MAIL_FROM=os.environ.get("MAIL_FROM", "dummy@gmail.com"),
    MAIL_PORT=int(os.environ.get("MAIL_PORT", 587)),
    MAIL_SERVER=os.environ.get("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME=os.environ.get("MAIL_FROM_NAME", "Office Management"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_welcome_email(email: EmailStr, password: str, first_name: str, role: str):
    html = f"""
    <p>Hi {first_name},</p>
    <p>Welcome to our Office Management System!</p>
    <p>Your account has been created successfully with the role <b>{role}</b>.</p>
    <p>Your temporary password is: <b>{password}</b></p>
    <p>Please login and change your password as soon as possible.</p>
    <br>
    <p>Best regards,<br>The HR Team</p>
    """

    message = MessageSchema(
        subject="Welcome to our Organization",
        recipients=[email],
        body=html,
        subtype="html"
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        print("Error sending email:", e)
