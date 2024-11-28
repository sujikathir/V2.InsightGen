from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging
from core.sql_processor.processor import SQLProcessor
from core.llm.llama_client import LlamaClient
from core.sql_processor.generator import SQLGenerator
import json
from decimal import Decimal
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(tags=["database"])

class DatabaseConnection(BaseModel):
    type: str
    host: str
    port: str
    database: str
    username: str
    password: Optional[str] = None

class ChatMessage(BaseModel):
    content: str
    role: str

class ChatRequest(BaseModel):
    message: str
    connection_id: str
    history: Optional[List[ChatMessage]] = []

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

@router.post("/chat")
async def process_chat(request: ChatRequest):
    try:
        logger.info(f"Processing chat request: {request.message}")
        
        # Initialize processors
        llm_client = LlamaClient()
        sql_processor = SQLProcessor()
        sql_generator = SQLGenerator(llm_client)
        
        # Get schema first
        schema = await sql_processor.reflect_database(request.connection_id)
        
        try:
            # Generate SQL query
            generated_sql = await sql_generator.generate_sql(
                question=request.message,
                schema=schema,
                connection_id=request.connection_id
            )
            
            # Execute the query
            results, metadata = await sql_processor.execute_query(
                connection_id=request.connection_id,
                query=generated_sql['sql']
            )
            
            # Format the results for display
            formatted_results = []
            if results:
                formatted_results = [
                    {k: str(v) if isinstance(v, (datetime, Decimal)) else v 
                     for k, v in row.items()}
                    for row in results
                ]
            
            return {
                "answer": "Here are the results of your query:",
                "sql_query": generated_sql['sql'],
                "results": formatted_results,
                "metadata": metadata,
                "followup_questions": [
                    f"Would you like to analyze the {len(formatted_results)} results in more detail?",
                    "Should we filter or group these results differently?",
                    "Would you like to see any specific calculations on these results?"
                ]
            }
            
        except ValueError as ve:
            # Handle validation errors gracefully
            return {
                "answer": f"I couldn't generate a valid SQL query: {str(ve)}",
                "error": str(ve)
            }
            
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/database/test")
async def test_database():
    """Test endpoint to verify database routes are working"""
    return {"status": "ok", "message": "Database routes are working"}

@router.get("/database/reflect/{connection_id}")
async def reflect_database_schema(connection_id: str):
    try:
        sql_processor = SQLProcessor()
        schema = await sql_processor.reflect_database(connection_id)
        return schema
    except Exception as e:
        logger.error(f"Failed to reflect database schema: {e}")
        raise HTTPException(status_code=500, detail=str(e))