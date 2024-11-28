# File Path: backend/api/routes/service_routes/document_routes.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from typing import Dict, Any, List, Optional
import os
from ...services.service_handlers.document_handler import DocumentHandler
from ...services.chat_service import ChatService
import logging
from fastapi.responses import StreamingResponse, JSONResponse
import io
from pydantic import BaseModel
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/documents")

# Initialize services
document_handler = DocumentHandler()
chat_service = ChatService()

# Data models
class DocumentStats(BaseModel):
    total_documents: int
    documents_by_type: Dict[str, int]
    successful_processing: int
    failed_processing: int
    total_storage: float  # in MB

class DocumentInfo(BaseModel):
    id: str
    filename: str
    file_type: str
    upload_date: datetime
    status: str
    size: float  # in KB
    metadata: Dict[str, Any]

class DatabaseStats(BaseModel):
    vector_count: int
    storage_used: float  # in MB
    collections: Dict[str, int]
    last_update: datetime

# Add this new model for chat requests
class ChatRequest(BaseModel):
    query: str
    document_id: str
    chat_history: List[Dict[str, str]] = []

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and process a document
    """
    logger.info(f"Received file upload request: {file.filename}")
    try:
        # Create directories if they don't exist
        os.makedirs("data/raw", exist_ok=True)
        os.makedirs("data/processed", exist_ok=True)
        logger.info("Created necessary directories")

        # Save uploaded file
        file_path = f"data/raw/{file.filename}"
        try:
            logger.info(f"Saving file to {file_path}")
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            logger.info("File saved successfully")

            # Get file type
            file_type = file.filename.split('.')[-1].lower()
            
            # Process document
            result = await document_handler.process_document(file_path, file_type)
            
            return JSONResponse(
                content=result,
                status_code=200
            )

        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info("Temporary file cleaned up")
                
    except Exception as e:
        logger.error(f"Error in upload process: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("upload_date", regex="^(upload_date|filename|status)$"),
    order: str = Query("desc", regex="^(asc|desc)$"),
    search: Optional[str] = None
):
    """
    List documents with pagination and filtering
    """
    try:
        return await document_handler.list_documents(page, limit, sort_by, order, search)
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preview/{document_id}")
async def preview_document(document_id: str):
    """
    Get a preview of a document
    """
    try:
        preview_data = await document_handler.get_document_preview(document_id)
        if not preview_data:
            raise HTTPException(status_code=404, detail="Document not found")
            
        return StreamingResponse(
            io.BytesIO(preview_data['content']),
            media_type=preview_data['content_type'],
            headers={'Content-Disposition': f'inline; filename="{preview_data["filename"]}"'}
        )
    except Exception as e:
        logger.error(f"Error previewing document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_document_stats():
    """
    Get document statistics
    """
    try:
        return await document_handler.get_document_stats()
    except Exception as e:
        logger.error(f"Error getting document stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """
    Delete a document and its associated data
    """
    try:
        await document_handler.delete_document(document_id)
        return {"message": "Document deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}")
async def get_document(document_id: str):
    """
    Get document details by ID
    """
    try:
        document = await document_handler.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return document
    except Exception as e:
        logger.error(f"Error getting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{document_id}/analyze")
async def analyze_document(document_id: str):
    """
    Analyze a document and extract insights
    """
    try:
        analysis = await document_handler.analyze_document(document_id)
        return {
            "document_id": document_id,
            "analysis": analysis
        }
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def document_chat(chat_request: ChatRequest):
    """Chat with a document"""
    try:
        # Add logging
        logger.info(f"Retrieving document: {chat_request.document_id}")
        document = await document_handler.get_document(chat_request.document_id)
        logger.info(f"Retrieved document content: {document.get('content', {})[:200]}...")

        # Extract text content, handling different possible structures
        content = document.get('content', {})
        text_content = None
        
        if isinstance(content, dict):
            text_content = content.get('text')
        elif isinstance(content, str):
            text_content = content

        if not text_content:
            logger.error(f"No text content found in document: {document}")
            raise HTTPException(
                status_code=400,
                detail="No text content available for this document"
            )

        # Process chat
        response = await chat_service.process_chat(
            query=chat_request.query,
            document_content=text_content,
            chat_history=chat_request.chat_history,
            mode="document_chat"
        )

        return {
            "answer": response.get("answer", ""),
            "metadata": {
                "document_id": chat_request.document_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Error in document chat: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# Additional helper endpoint for document processing status
@router.get("/{document_id}/status")
async def get_processing_status(document_id: str):
    """
    Get the processing status of a document
    """
    try:
        status = await document_handler.get_processing_status(document_id)
        return {"document_id": document_id, "status": status}
    except Exception as e:
        logger.error(f"Error getting processing status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Export the router directly
export = router