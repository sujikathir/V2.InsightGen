from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Request
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, ValidationError, Field, validator
from ..services.service_handlers.database_handler import DatabaseHandler
from ..services.service_handlers.legal_handler import LegalHandler
from ..services.service_handlers.finance_handler import FinanceHandler
from ..services.service_handlers.marketing_handler import MarketingHandler
from ..services.service_handlers.registration_handler import RegistrationHandler
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    content: str
    role: str = Field(default="user", pattern="^(user|assistant)$")

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    service_type: str = Field(..., pattern="^(legal|database|finance|marketing|registration)$")
    context: Dict[str, Any] = Field(default_factory=dict)
    chat_history: List[ChatMessage] = Field(default_factory=list)
    connection_id: str = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "message": "What is this document about?",
                "service_type": "legal",
                "context": {"document_id": "some-uuid"},
                "chat_history": [],
                "connection_id": "some-connection-id"
            }
        }

    @validator('service_type')
    def validate_service_type(cls, v):
        allowed_types = {'legal', 'database', 'finance', 'marketing', 'registration'}
        if v not in allowed_types:
            raise ValueError(f'service_type must be one of {allowed_types}')
        return v

class ChatResponse(BaseModel):
    answer: str
    insights: Dict[str, Any] = {}
    sources: List[str] = []
    metadata: Dict[str, Any] = {}

def get_service_handler(service_type: str):
    handlers = {
        "database": DatabaseHandler(),
        "legal": LegalHandler(),
        "finance": FinanceHandler(),
        "marketing": MarketingHandler(),
        "registration": RegistrationHandler()
    }
    
    handler = handlers.get(service_type)
    if not handler:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid service type: {service_type}"
        )
    return handler

@router.post("/chat", response_model=ChatResponse)
async def chat(request: Request, chat_request: ChatRequest):
    # Log raw request body
    body = await request.json()
    logger.info(f"Raw request body: {body}")
    
    try:
        logger.info(f"Parsed chat request: {chat_request.dict()}")
        
        handler = get_service_handler(chat_request.service_type)
        logger.info(f"Using handler: {handler.__class__.__name__}")
        
        response = await handler.process_message(
            message=chat_request.message,
            context=chat_request.context,
            chat_history=[msg.dict() for msg in chat_request.chat_history],
            connection_id=chat_request.connection_id
        )
        
        logger.info(f"Handler response: {response}")
        
        chat_response = ChatResponse(
            answer=response.get("answer", "No response generated"),
            insights=response.get("insights", {}),
            sources=response.get("sources", []),
            metadata=response.get("metadata", {})
        )
        
        logger.info(f"Final response: {chat_response.dict()}")
        return chat_response
        
    except ValidationError as e:
        logger.error(f"Validation error details: {e.errors()}")
        raise HTTPException(
            status_code=422,
            detail=e.errors()
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        logger.info(f"Received file upload: {file.filename}")
        
        # Generate a unique document ID
        document_id = str(uuid.uuid4())
        
        # Read file content
        content = await file.read()
        
        # Here you would typically:
        # 1. Save the file to disk/storage
        # 2. Process the document
        # 3. Store metadata in database
        
        return {
            "id": document_id,
            "filename": file.filename,
            "size": len(content),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/{document_id}/analyze")
async def analyze_document(document_id: str):
    try:
        logger.info(f"Analyzing document: {document_id}")
        
        # Here you would typically:
        # 1. Retrieve the document
        # 2. Process it with your analysis logic
        # 3. Return results
        
        return {
            "document_id": document_id,
            "status": "completed",
            "analysis": {
                "summary": "Document analysis would go here",
                "key_points": []
            }
        }
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/debug/document/{document_id}")
async def debug_document(document_id: str):
    """Debug endpoint to check document content"""
    try:
        document_service = DocumentService()
        content = await document_service.get_document_content(document_id)
        metadata = await document_service.get_document_metadata(document_id)
        
        # Test document identification
        handler = LegalHandler()
        doc_type = handler._identify_document_type(content)
        
        return {
            "metadata": metadata,
            "content_preview": str(content)[:1000] if content else None,
            "content_length": len(str(content)) if content else 0,
            "identified_type": doc_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))