# backend/api/services/service_handlers/registration_handler.py
from .base_handler import BaseHandler
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class RegistrationHandler(BaseHandler):
    def __init__(self):
        super().__init__()
        self.system_message = """You are a specialized business registration AI assistant.
        Help analyze and understand business registration documents and requirements.
        Focus on compliance requirements, registration procedures, and necessary documentation.
        Provide clear, step-by-step guidance while noting you're not providing legal advice."""

    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        chat_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        try:
            document_id = context.get("document_id")
            document_content = await self._get_document_content(document_id)
            
            prompt = self._prepare_prompt(message, document_content, chat_history)
            response = await self._get_llm_response(prompt, self.system_message)
            
            return {
                "answer": response,
                "insights": self._extract_insights(response),
                "sources": [{"content": document_content}],
                "metadata": {
                    "document_id": document_id,
                    "analysis_type": "registration"
                }
            }
            
        except Exception as e:
            logger.error(f"Error in registration handler: {e}")
            raise

    def _prepare_prompt(self, message: str, document_content: str, chat_history: List[Dict[str, str]]) -> str:
        history_text = "\n".join([
            f"Human: {msg['content']}" if msg['role'] == 'user' 
            else f"Assistant: {msg['content']}"
            for msg in (chat_history or [])
        ])

        return f"""Analyze the following business registration document content:

Document Content:
{document_content}

Previous conversation:
{history_text}

Current Question: {message}

Provide a detailed analysis including:
1. Registration requirements and prerequisites
2. Required documentation and forms
3. Compliance considerations
4. Timeline and cost estimates
5. Step-by-step registration process
6. Potential challenges and solutions

Present information clearly and highlight critical requirements."""

    def _extract_insights(self, response: str) -> Dict[str, Any]:
        return {
            "summary": response[:200],
            "requirements": [],         # Extract registration requirements
            "documentation": [],        # Extract required documents
            "compliance_notes": [],     # Extract compliance requirements
            "timeline": {},            # Extract timeline information
            "cost_estimates": {},      # Extract cost estimates
            "next_steps": []           # Extract recommended next steps
        }