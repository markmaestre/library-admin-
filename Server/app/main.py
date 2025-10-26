from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import auth_router
from app.routes.books import book_router  # Add this import
from app.config.database import db
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()
PORT = int(os.getenv("PORT", 4000))

app = FastAPI(title="Book Library API")

# ✅ Add CORS so React Native can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register routes
app.include_router(auth_router)
app.include_router(book_router)  # Add this line

@app.get("/ping-db")
async def ping_db():
    try:
        await db.command("ping")
        return {"status": "success", "message": "Database connected!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True)