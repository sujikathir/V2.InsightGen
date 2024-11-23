# backend/api/services/base_service.py
from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseService(ABC):
    @abstractmethod
    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        chat_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Process a chat message and return a response"""
        pass

    @abstractmethod
    async def initialize_chat(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize a new chat session"""
        pass