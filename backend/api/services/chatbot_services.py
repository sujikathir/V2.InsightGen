# File: insightgen/backend/api/services/chatbot_services.py

from typing import Dict, List, Any, Optional
from api.utils.llm_utils import get_llm_response  # Assuming you have this utility
import logging

logger = logging.getLogger(__name__)

class BaseChatbotService:
    def __init__(self):
        self.conversation_history = []
        
    async def _get_response(self, prompt: str, system_prompt: str) -> str:
        try:
            response = await get_llm_response(
                messages=[
                    {"role": "system", "content": system_prompt},
                    *self.conversation_history,
                    {"role": "user", "content": prompt}
                ]
            )
            self.conversation_history.append({"role": "user", "content": prompt})
            self.conversation_history.append({"role": "assistant", "content": response})
            return response
        except Exception as e:
            logger.error(f"Error getting LLM response: {e}")
            raise

class RegistrationChatbotService(BaseChatbotService):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are a business registration expert chatbot. Your role is to:
1. Guide users through the business registration process
2. Ask relevant questions about their business plans
3. Provide state-specific registration requirements
4. Explain costs and timelines
5. Recommend appropriate business structures
6. Help with company name selection and domain registration

Start by asking the user about:
- Type of business they want to start
- Preferred state of registration
- Expected size and scale
- Ownership structure preferences"""

    async def process_query(self, query: str) -> Dict[str, Any]:
        response = await self._get_response(query, self.system_prompt)
        return {
            "answer": response,
            "next_steps": self._extract_next_steps(response),
            "estimated_costs": self._extract_costs(response)
        }

class LegalChatbotService(BaseChatbotService):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are a legal assistant chatbot specialized in small business law. Your role is to:
1. Analyze business documents and identify potential legal issues
2. Provide general legal information and guidance
3. Explain regulatory requirements
4. Suggest preventive legal measures
5. Help with basic contract understanding

Remember to always include a disclaimer that you're providing general information, not legal advice."""

    async def process_query(self, query: str, document_content: Optional[str] = None) -> Dict[str, Any]:
        if document_content:
            query = f"Document content: {document_content}\n\nUser query: {query}"
        response = await self._get_response(query, self.system_prompt)
        return {
            "answer": response,
            "risks_identified": self._extract_risks(response),
            "recommendations": self._extract_recommendations(response)
        }

class FinanceChatbotService(BaseChatbotService):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are a financial advisor chatbot for small businesses. Your role is to:
1. Help with financial planning and budgeting
2. Provide tax-related guidance
3. Assist with ROI calculations
4. Explain financial metrics and KPIs
5. Offer cash flow management advice
6. Guide through basic accounting practices

Focus on practical, actionable financial advice for small business owners."""

    async def process_query(self, query: str, financial_data: Optional[Dict] = None) -> Dict[str, Any]:
        if financial_data:
            query = f"Financial data: {financial_data}\n\nUser query: {query}"
        response = await self._get_response(query, self.system_prompt)
        return {
            "answer": response,
            "financial_insights": self._extract_insights(response),
            "action_items": self._extract_action_items(response)
        }

class MarketingChatbotService(BaseChatbotService):
    def __init__(self):
        super().__init__()
        self.system_prompt = """You are a marketing and branding expert chatbot. Your role is to:
1. Help develop marketing strategies
2. Provide branding recommendations
3. Suggest content marketing approaches
4. Guide social media strategy
5. Assist with target audience identification
6. Recommend marketing channels and budget allocation

Focus on practical, cost-effective marketing solutions for new businesses."""

    async def process_query(self, query: str, business_info: Optional[Dict] = None) -> Dict[str, Any]:
        if business_info:
            query = f"Business info: {business_info}\n\nUser query: {query}"
        response = await self._get_response(query, self.system_prompt)
        return {
            "answer": response,
            "strategy_points": self._extract_strategy_points(response),
            "recommended_actions": self._extract_recommendations(response)
        }