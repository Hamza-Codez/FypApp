import os
from datetime import datetime, timedelta, timezone
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
    # bcrypt has a 72-byte limit, so we truncate the password for verification
    if len(plain_password) > 50:
        plain_password = plain_password[:50]
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # bcrypt has a 72-byte limit, so we truncate the password to ensure it's within limits
    # Truncate to 50 characters to be safe (well under 72 bytes for most encodings)
    if len(password) > 50:
        password = password[:50]
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
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
    except Exception:
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

async def send_welcome_email(email: EmailStr, password: str, first_name: str, role: str, organization_name: str = "Office Management System"):
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body {{ 
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            background-color: #f8fafc; 
            margin: 0; 
            padding: 0; 
            -webkit-font-smoothing: antialiased; 
        }}
        .container {{ 
            max-width: 600px; 
            margin: 40px auto; 
            background-color: #ffffff; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
            border: 1px solid #e2e8f0; 
        }}
        .header {{ 
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); 
            padding: 40px 30px; 
            text-align: center; 
            color: #ffffff; 
        }}
        .logo-circle {{ 
            background-color: rgba(255, 255, 255, 0.2); 
            color: #ffffff; 
            width: 56px; 
            height: 56px; 
            line-height: 56px; 
            border-radius: 16px; 
            display: inline-block; 
            font-weight: 800; 
            font-size: 28px; 
            margin-bottom: 16px; 
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(4px);
        }}
        .content {{ 
            padding: 40px; 
            color: #334155; 
            line-height: 1.6; 
        }}
        .greeting {{ 
            font-size: 22px; 
            font-weight: 600; 
            color: #1e293b; 
            margin-bottom: 24px; 
        }}
        .card {{ 
            background-color: #f8fafc; 
            border-radius: 12px; 
            padding: 24px; 
            margin: 32px 0; 
            border: 1px solid #e2e8f0; 
        }}
        .credential-group {{
            margin-bottom: 20px;
        }}
        .credential-group:last-child {{
            margin-bottom: 0;
        }}
        .credential-label {{ 
            font-size: 11px; 
            text-transform: uppercase; 
            letter-spacing: 0.1em; 
            color: #64748b; 
            font-weight: 700; 
            margin-bottom: 6px; 
        }}
        .credential-value {{ 
            font-size: 16px; 
            font-weight: 600; 
            color: #0f172a; 
        }}
        .password-value {{
            font-family: 'Courier New', Courier, monospace;
            background-color: #eff6ff;
            color: #2563eb;
            padding: 4px 8px;
            border-radius: 4px;
            letter-spacing: 1px;
        }}
        .footer {{ 
            padding: 30px; 
            text-align: center; 
            font-size: 13px; 
            color: #94a3b8; 
            background-color: #f1f5f9;
            border-top: 1px solid #e2e8f0; 
        }}
        .security-note {{ 
            font-size: 13px; 
            color: #64748b; 
            margin-top: 32px; 
            padding: 16px;
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
        }}
        @media only screen and (max-width: 600px) {{
            .container {{ margin: 0; border-radius: 0; }}
            .content {{ padding: 30px 20px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-circle">{organization_name[0] if organization_name else 'O'}</div>
            <h1 style="margin:0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">{organization_name}</h1>
        </div>
        <div class="content">
            <p class="greeting">Hi {first_name},</p>
            <p>Welcome aboard! Your professional account for <strong>{organization_name}</strong> has been successfully created. You can now access the dashboard as a <strong>{role}</strong>.</p>
            
            <div class="card">
                <div class="credential-group">
                    <div class="credential-label">Login Email</div>
                    <div class="credential-value">{email}</div>
                </div>
                
                <div class="credential-group">
                    <div class="credential-label">Temporary Password</div>
                    <div class="credential-value password-value">{password}</div>
                </div>
            </div>

            <p style="margin-top: 32px; text-align: center;">
                <a href="https://yourdashboardurl.com" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Launch Dashboard</a>
            </p>

            <div class="security-note">
                <strong>Security Reminder:</strong> Please ensure you change your temporary password immediately upon your first login to keep your account secure.
            </div>
        </div>
        <div class="footer">
            &copy; 2026 {organization_name}. All rights reserved.<br>
            Sent by the HR Management System.
        </div>
    </div>
</body>
</html>
    """

    message = MessageSchema(
        subject=f"Welcome to {organization_name}",
        recipients=[email],
        body=html,
        subtype="html"
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception:
        pass

