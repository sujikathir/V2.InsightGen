# backend/api/routes/chat_routes.py
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from ..services.service_handlers.database_handler import DatabaseHandler
from ..services.service_handlers.legal_handler import LegalHandler
from ..services.service_handlers.finance_handler import FinanceHandler
from ..services.service_handlers.marketing_handler import MarketingHandler
from ..services.service_handlers.registration_handler import RegistrationHandler
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    content: str
    role: str = "user"

class ChatRequest(BaseModel):
    message: str
    service_type: str  # database, legal, finance, marketing, or registration
    context: Dict[str, Any]
    chat_history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    answer: str
    insights: Optional[Dict[str, Any]] = None
    sources: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None

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
async def chat(request: ChatRequest):
    try:
        logger.info(f"Processing chat request for service: {request.service_type}")
        
        # Get appropriate handler
        handler = get_service_handler(request.service_type)
        
        # Process message
        response = await handler.process_message(
            message=request.message,
            context=request.context,
            chat_history=[msg.dict() for msg in request.chat_history]
        )
        
        return response
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))