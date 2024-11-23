# File Path: backend/api/routes/service_routes/database_routes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
from core.sql_processor.processor import SQLProcessor

logger = logging.getLogger(__name__)

# Create router without prefix - we'll add prefix in main.py
router = APIRouter(tags=["database"])

class DatabaseConnection(BaseModel):
    type: str
    host: str
    port: str
    database: str
    username: str
    password: Optional[str] = None


@router.post("/database/connect")
async def connect_database(connection: DatabaseConnection):
    try:
        # Create connection string
        connection_string = f"postgresql://{connection.username}:{connection.password or ''}@{connection.host}:{connection.port}/{connection.database}"
        
        # Create a unique connection ID
        connection_id = "postgres_main"
        
        # Connect using SQL processor
        sql_processor = SQLProcessor()
        success = await sql_processor.connect_database(
            connection_id=connection_id,
            connection_string=connection_string
        )
        
        if success:
            return {
                "connection_id": connection_id,
                "status": "connected",
                "database": connection.database
            }
            
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Add a test endpoint
@router.get("/database/test")
async def test_database():
    """Test endpoint to verify database routes are working"""
    return {"status": "ok", "message": "Database routes are working"}