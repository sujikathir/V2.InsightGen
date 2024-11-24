# backend/api/services/service_handlers/finance_handler.py
from .base_handler import BaseHandler
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class FinanceHandler(BaseHandler):
    def __init__(self):
        super().__init__()
        self.system_message = """You are a specialized financial document analysis AI assistant. 
        Provide detailed financial analysis and insights from documents.
        Focus on financial metrics, trends, risks, and opportunities.
        Present information in a clear, structured manner with quantitative analysis where possible."""

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
                    "analysis_type": "financial"
                }
            }
            
        except Exception as e:
            logger.error(f"Error in finance handler: {e}")
            raise

    def _prepare_prompt(self, message: str, document_content: str, chat_history: List[Dict[str, str]]) -> str:
        history_text = "\n".join([
            f"Human: {msg['content']}" if msg['role'] == 'user' 
            else f"Assistant: {msg['content']}"
            for msg in (chat_history or [])
        ])

        return f"""Analyze the following financial document content:

Document Content:
{document_content}

Previous conversation:
{history_text}

Current Question: {message}

Provide a detailed financial analysis including:
1. Key financial metrics and their interpretation
2. Trends and patterns in the data
3. Financial risks and opportunities
4. Actionable recommendations
5. Comparative analysis if applicable

Present numerical data clearly and provide specific insights."""

    def _extract_insights(self, response: str) -> Dict[str, Any]:
        return {
            "summary": response[:200],
            "key_metrics": [],  # Extract key financial metrics
            "trends": [],       # Extract identified trends
            "risks": [],        # Extract risk factors
            "opportunities": [] # Extract growth opportunities
        }