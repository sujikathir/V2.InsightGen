# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from api.routes.service_routes.database_routes import router as database_router
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection setup
@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    app.mongodb = app.mongodb_client[os.getenv("MONGODB_DB_NAME", "smallbusiness")]
    try:
        # Verify the connection
        await app.mongodb.command("ping")
        print("Successfully connected to MongoDB")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    if hasattr(app, "mongodb_client"):
        app.mongodb_client.close()

# Include database routes
app.include_router(
    database_router,
    prefix="/api/v1",
    tags=["database"]
)

# Add a test route
@app.get("/")
async def root():
    return {"message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting server on {host}:{port}")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )