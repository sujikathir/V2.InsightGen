from typing import Dict, List, Any

class BaseHandler:
    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        chat_history: List[Dict[str, Any]],
        connection_id: str
    ) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement process_message")

    async def cleanup_connection(self, connection_id: str):
        """Clean up any resources associated with a connection"""
        pass