from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class AdminRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    address: Optional[str] = None
    phone: Optional[str] = None

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    phone: Optional[str] = None
