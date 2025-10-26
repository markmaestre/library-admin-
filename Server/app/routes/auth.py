from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.user import UserRegister, UserLogin
from app.config.database import db
from app.utils.auth_handler import create_access_token, verify_token

auth_router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models for new endpoints
class BanUserRequest(BaseModel):
    reason: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_banned: bool
    ban_reason: Optional[str] = None
    banned_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

# Dependency to check if user is admin
async def get_current_admin(token: str = Depends(verify_token)):
    if token.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return token

# REGISTER
@auth_router.post("/register")
async def register(user: UserRegister):
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_password

    # Ensure role is valid
    if user_dict.get("role") not in ["admin", "user"]:
        user_dict["role"] = "user"

    # Add additional fields
    user_dict["is_banned"] = False
    user_dict["ban_reason"] = None
    user_dict["banned_at"] = None
    user_dict["created_at"] = datetime.utcnow()

    await db["users"].insert_one(user_dict)
    return {"message": "User registered successfully", "role": user_dict["role"]}

# LOGIN
@auth_router.post("/login")
async def login(user: UserLogin):
    existing_user = await db["users"].find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Check if user is banned
    if existing_user.get("is_banned", False):
        ban_reason = existing_user.get("ban_reason", "No reason provided")
        raise HTTPException(
            status_code=403, 
            detail=f"Account is banned. Reason: {ban_reason}"
        )

    if not pwd_context.verify(user.password, existing_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token({
        "email": user.email,
        "role": existing_user.get("role", "user"),
        "name": existing_user.get("name", "")
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": existing_user.get("role", "user"),
        "name": existing_user.get("name", "")
    }

# GET ALL USERS (Admin only)
@auth_router.get("/users", response_model=List[UserResponse])
async def get_all_users(current_admin: dict = Depends(get_current_admin)):
    users = []
    async for user in db["users"].find({}, {"password": 0}):  # Exclude password
        users.append({
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name", ""),
            "role": user.get("role", "user"),
            "is_banned": user.get("is_banned", False),
            "ban_reason": user.get("ban_reason"),
            "banned_at": user.get("banned_at"),
            "created_at": user.get("created_at")
        })
    return users

# BAN USER (Admin only)
@auth_router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: str, 
    ban_request: BanUserRequest,
    current_admin: dict = Depends(get_current_admin)
):
    from bson import ObjectId
    
    try:
        user_object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db["users"].find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent banning admins
    if user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot ban admin users")

    update_result = await db["users"].update_one(
        {"_id": user_object_id},
        {
            "$set": {
                "is_banned": True,
                "ban_reason": ban_request.reason,
                "banned_at": datetime.utcnow()
            }
        }
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to ban user")

    return {"message": "User banned successfully", "reason": ban_request.reason}

# UNBAN USER (Admin only)
@auth_router.post("/users/{user_id}/unban")
async def unban_user(
    user_id: str, 
    current_admin: dict = Depends(get_current_admin)
):
    from bson import ObjectId
    
    try:
        user_object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db["users"].find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_result = await db["users"].update_one(
        {"_id": user_object_id},
        {
            "$set": {
                "is_banned": False,
                "ban_reason": None,
                "banned_at": None
            }
        }
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to unban user")

    return {"message": "User unbanned successfully"}

# GET USER BY ID (Admin only)
@auth_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_admin: dict = Depends(get_current_admin)):
    from bson import ObjectId
    
    try:
        user_object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db["users"].find_one({"_id": user_object_id}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "is_banned": user.get("is_banned", False),
        "ban_reason": user.get("ban_reason"),
        "banned_at": user.get("banned_at"),
        "created_at": user.get("created_at")
    }