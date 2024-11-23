# backend/config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # App settings
    APP_NAME = "SmallBusiness Backend"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # API settings
    API_V1_PREFIX = "/api/v1"
    
    # Database settings
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "smallbusiness")
    
    # LLM settings
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    # Document settings
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

settings = Settings()