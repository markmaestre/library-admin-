import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET", "your-fallback-secret-key-change-in-production")
ALGORITHM = "HS256"

# Initialize password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTPBearer for token extraction
security = HTTPBearer()

# -------------------------------
# PASSWORD HASHING FUNCTIONS
# -------------------------------
def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify that a plaintext password matches the hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)

# -------------------------------
# JWT TOKEN FUNCTIONS
# -------------------------------
def create_access_token(data: dict, expires_delta: int = 60):
    """
    Create a JWT access token
    
    Args:
        data: Dictionary containing user data (email, role, name)
        expires_delta: Token expiration time in minutes (default: 60 minutes)
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    """
    Decode and verify a JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify a JWT token (wrapper around decode_access_token)
    
    Args:
        credentials: HTTPAuthorizationCredentials from dependency
        
    Returns:
        Decoded token payload if valid, raises exception otherwise
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

# -------------------------------
# EXTRA VERIFICATION HELPERS
# -------------------------------
def verify_token_string(token: str):
    """
    Verify a JWT token from string (without HTTPBearer dependency)
    """
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    FastAPI dependency to get current user from JWT token
    """
    return verify_token(credentials)

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """
    Dependency to check if user is active
    """
    return current_user

async def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    """
    Dependency to check if user has admin role
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
