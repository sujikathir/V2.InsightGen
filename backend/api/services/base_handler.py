# backend/api/services/base_handler.py
from abc import ABC, abstractmethod
from typing import Dict, List, Any
from groq import AsyncGroq
import os
from dotenv import load_dotenv
from .document_service import DocumentService

load_dotenv()

class BaseHandler(ABC):
    def __init__(self):
        self.groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama2-70b-4096"
        self.document_service = DocumentService()

    async def _get_document_content(self, document_id: str) -> str:
        return await self.document_service.get_document_content(document_id)

    async def _get_document_metadata(self, document_id: str) -> Dict[str, Any]:
        return await self.document_service.get_document_metadata(document_id)

    @abstractmethod
    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        chat_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        pass

    async def _get_llm_response(self, prompt: str, system_message: str) -> str:
        try:
            chat_completion = await self.groq_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4096,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error getting LLM response: {str(e)}")