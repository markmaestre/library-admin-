from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.models.admin import AdminRegister, AdminLogin, AdminUpdate
from app.config.database import db
from app.utils.auth_handler import (
    create_access_token,
    hash_password,
    verify_password,
    verify_token,
)

admins_router = APIRouter(prefix="/admins", tags=["Admins"])

# 🧩 Register Admin (Restricted by email)
@admins_router.post("/register")
async def register_admin(admin: AdminRegister):
    if not admin.email.endswith("@admin.com"):
        raise HTTPException(status_code=403, detail="Only admin emails allowed")

    existing = await db["admins"].find_one({"email": admin.email})
    if existing:
        raise HTTPException(status_code=400, detail="Admin email already registered")

    admin_dict = admin.dict()
    admin_dict["password"] = hash_password(admin.password)
    admin_dict["role"] = "admin"
    admin_dict["created_at"] = datetime.utcnow()

    await db["admins"].insert_one(admin_dict)
    return {"message": "Admin registered successfully"}


# 🔐 Admin Login
@admins_router.post("/login")
async def admin_login(data: AdminLogin):
    admin = await db["admins"].find_one({"email": data.email})
    if not admin or not verify_password(data.password, admin["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token(
        {
            "email": admin["email"],
            "name": admin["name"],
            "role": "admin",
            "id": str(admin["_id"]),
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "admin",
        "name": admin["name"],
        "id": str(admin["_id"]),  # ✅ Added this so frontend can store ID
    }


# 🧑‍💻 Get Admin Profile
@admins_router.get("/profile/{admin_id}")
async def get_admin_profile(admin_id: str, current_admin: dict = Depends(verify_token)):
    if current_admin.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        obj_id = ObjectId(admin_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    admin = await db["admins"].find_one({"_id": obj_id})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # ✅ Remove sensitive info like password
    admin["_id"] = str(admin["_id"])
    admin.pop("password", None)

    return admin


# ✏️ Edit Admin Profile
@admins_router.put("/edit-profile/{admin_id}")
async def edit_profile(admin_id: str, update: AdminUpdate, current_admin: dict = Depends(verify_token)):
    if current_admin.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        obj_id = ObjectId(admin_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    result = await db["admins"].update_one(
        {"_id": obj_id},
        {"$set": {k: v for k, v in update.dict().items() if v is not None}},
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found or no changes made")

    return {"message": "Profile updated successfully"}
