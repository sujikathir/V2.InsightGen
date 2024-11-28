# api/routes/service_routes/legal_routes.py

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
from fastapi.responses import JSONResponse
from ...services.service_handlers.legal_handler import LegalHandler
from ...services.chatbot_services import LegalChatbotService
import os
import uuid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/legal", tags=["legal"])

# Initialize handlers
legal_handler = LegalHandler()
chatbot_service = LegalChatbotService()

# Data Models
class LegalQueryRequest(BaseModel):
    message: str
    service_type: str = "legal"
    context: Dict[str, Any] = Field(default_factory=dict)
    chat_history: List[Dict[str, str]] = Field(default_factory=list)
    connection_id: str = Field(...)

class LegalDocumentAnalysisRequest(BaseModel):
    document_id: str
    analysis_type: Optional[str] = "general"
    context: Dict[str, Any] = Field(default_factory=dict)

@router.post("/upload")
async def upload_legal_document(file: UploadFile = File(...)):
    """Upload and process a legal document"""
    logger.info(f"Received legal document upload: {file.filename}")
    try:
        # Create directories
        os.makedirs("data/legal/raw", exist_ok=True)
        os.makedirs("data/legal/processed", exist_ok=True)

        # Generate unique file path
        file_path = f"data/legal/raw/{uuid.uuid4()}_{file.filename}"
        
        try:
            # Save file
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Process document
            result = await legal_handler.handle_upload(
                file_path=file_path,
                file_type=file.filename.split('.')[-1].lower()
            )
            
            return JSONResponse(
                content={
                    "status": "success",
                    "message": "Legal document processed successfully",
                    "data": result
                },
                status_code=200
            )
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info("Temporary file cleaned up")
                
    except Exception as e:
        logger.error(f"Error processing legal document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def legal_chat(request: LegalQueryRequest):
    """Legal-specific document chat"""
    logger.info(f"Received legal chat request: {request}")
    try:
        response = await legal_handler.process_message(
            message=request.message,
            context=request.context,
            chat_history=request.chat_history,
            connection_id=request.connection_id
        )
        
        # Ensure consistent response format
        return {
            "answer": response.get("answer", "Sorry, I couldn't process that request."),
            "metadata": response.get("metadata", {}),
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Legal chat error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(e),
                "answer": "Sorry, there was an error processing your request."
            }
        )

@router.post("/analyze")
async def analyze_legal_document(request: LegalDocumentAnalysisRequest):
    """Legal-specific document analysis"""
    try:
        analysis = await legal_handler.analyze_document(
            document_id=request.document_id,
            analysis_type=request.analysis_type,
            context=request.context
        )
        return {
            "document_id": request.document_id,
            "analysis": analysis,
            "analysis_type": request.analysis_type
        }
    except Exception as e:
        logger.error(f"Legal analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-clauses/{document_id}")
async def extract_legal_clauses(
    document_id: str,
    clause_types: List[str] = Query(["all"])
):
    """Extract specific legal clauses"""
    try:
        clauses = await legal_handler.extract_clauses(document_id, clause_types)
        return {
            "document_id": document_id,
            "clauses": clauses
        }
    except Exception as e:
        logger.error(f"Clause extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize/{document_id}")
async def summarize_legal_document(
    document_id: str,
    format_type: str = Query("brief", regex="^(brief|detailed|structured)$")
):
    """Generate legal document summary"""
    try:
        summary = await legal_handler.generate_summary(document_id, format_type)
        return {
            "document_id": document_id,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Summary generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Export the router
export = router