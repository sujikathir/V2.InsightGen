# backend/api/routes/service_routes/registration_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

from api.services.chatbot_services import RegistrationChatbotService

class RegistrationQueryRequest(BaseModel):
    query: str

@router.post("/registration-chat")
async def registration_chat(request: RegistrationQueryRequest):
    try:
        chatbot = RegistrationChatbotService()
        response = await chatbot.process_query(request.query)
        return response
    except Exception as e:
        logger.error(f"Registration chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class BusinessInfoRequest(BaseModel):
    business_name: str
    business_type: str
    state: str
    structure: str  # LLC, Corporation, Partnership, etc.
    owner_info: Dict[str, Any]
    estimated_revenue: Optional[float]
    employee_count: Optional[int]

class DomainCheckRequest(BaseModel):
    business_name: str
    alternate_names: Optional[List[str]]
    industry: str
    preferred_tlds: Optional[List[str]] = [".com", ".net", ".org"]

class RegistrationStatusRequest(BaseModel):
    registration_id: str
    state: str

class RegistrationResponse(BaseModel):
    status: str
    next_steps: List[str]
    required_documents: List[Dict[str, Any]]
    estimated_costs: Dict[str, float]
    timeline: Dict[str, Any]
    additional_resources: Optional[List[Dict[str, str]]]

@router.post("/business-registration", response_model=RegistrationResponse)
async def register_business(request: BusinessInfoRequest):
    try:
        # Implement business registration logic here
        return RegistrationResponse(
            status="pending",
            next_steps=[],
            required_documents=[],
            estimated_costs={},
            timeline={},
            additional_resources=[]
        )
    except Exception as e:
        logger.error(f"Business registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-domain-availability")
async def check_domain(request: DomainCheckRequest):
    try:
        # Implement domain checking logic here
        return {
            "available_domains": [],
            "suggestions": [],
            "pricing": {}
        }
    except Exception as e:
        logger.error(f"Domain check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/registration-status/{registration_id}")
async def check_registration_status(registration_id: str):
    try:
        # Implement registration status check logic here
        return {
            "status": "pending",
            "completed_steps": [],
            "next_steps": [],
            "estimated_completion": ""
        }
    except Exception as e:
        logger.error(f"Registration status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/name-availability")
async def check_business_name(business_name: str, state: str):
    try:
        # Implement business name availability check logic here
        return {
            "available": True,
            "similar_names": [],
            "suggestions": []
        }
    except Exception as e:
        logger.error(f"Name availability check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))