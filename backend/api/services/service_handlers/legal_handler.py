# backend/api/services/service_handlers/legal_handler.py
from ...services.base_handler import BaseHandler
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class LegalHandler(BaseHandler):
    def __init__(self):
        super().__init__()
        self.system_message = """You are a specialized legal document analysis AI assistant. 
        Provide clear analysis of legal documents while noting that you're not providing legal advice.
        Focus on identifying key legal terms, obligations, and potential risks."""

    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        chat_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        try:
            # Get document content from context
            document_id = context.get("document_id")
            document_content = await self._get_document_content(document_id)
            
            # Prepare prompt
            prompt = self._prepare_prompt(message, document_content, chat_history)
            
            # Get LLM response
            response = await self._get_llm_response(prompt, self.system_message)
            
            return {
                "answer": response,
                "insights": self._extract_insights(response),
                "sources": [{"content": document_content}],
                "metadata": {"document_id": document_id}
            }
            
        except Exception as e:
            logger.error(f"Error in legal handler: {e}")
            raise

    def _prepare_prompt(self, message: str, document_content: str, chat_history: List[Dict[str, str]]) -> str:
        history_text = "\n".join([
            f"Human: {msg['content']}" if msg['role'] == 'user' 
            else f"Assistant: {msg['content']}"
            for msg in (chat_history or [])
        ])

        return f"""Analyze the following legal document content:

Document Content:
{document_content}

Previous conversation:
{history_text}

Current Question: {message}

Provide a detailed legal analysis including:
1. Key legal terms and definitions
2. Important clauses and their implications
3. Potential risks or compliance issues
4. Recommended areas for attention"""

    def _extract_insights(self, response: str) -> Dict[str, Any]:
        return {
            "summary": response[:200],
            "legal_issues": [],  # Extract legal issues
            "risk_factors": [],  # Extract risk factors
            "recommendations": []  # Extract recommendations
        }

    async def _get_document_content(self, document_id: str) -> str:
        # Implement document retrieval logic
        # This should connect to your document storage/database
        pass