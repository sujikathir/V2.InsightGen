# backend/api/services/service_handlers/database_handler.py
from typing import Dict, Any, List
from ..base_service import BaseService
from ..chat_service import ChatService
from core.sql_processor.processor import SQLProcessor

class DatabaseHandler:
    def __init__(self):
        self.sql_processor = SQLProcessor()
        self.chat_service = ChatService()

    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        chat_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        try:
            # Generate SQL
            sql_response = await self.sql_processor.generate_sql(message)
            
            # Execute SQL query
            results = await self.sql_processor.execute_query(
                connection_id=context.get('connection_id'),
                query=sql_response
            )

            # Generate insights
            insights = await self.chat_service.process_chat(
                message=message,
                context=results,
                chat_history=chat_history
            )
            
            return {
                "answer": insights['summary']['overview'],
                "sql_query": sql_response['sql'],
                "results": results['data'],
                "insights": insights['insights'],
                "visualization_suggestions": insights['visualizations'],
                "metadata": results['metadata']
            }
        except Exception as e:
            raise Exception(f"Error processing database query: {str(e)}")