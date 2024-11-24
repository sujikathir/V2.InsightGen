import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from .base_handler import BaseHandler
from ..document_service import DocumentService
from core.llm.llama_client import LlamaClient
from core.rag.retriever import RAGRetriever
from core.document_processor.processor import DocumentProcessor

logger = logging.getLogger(__name__)

class LegalHandler(BaseHandler):
    def __init__(self):
        super().__init__()
        self.document_service = DocumentService()
        self.llm_client = LlamaClient()
        self.rag_retriever = RAGRetriever()
        self.document_processor = DocumentProcessor()
        self.active_connections = {}

    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        chat_history: List[Dict[str, str]],
        connection_id: str
    ) -> Dict[str, Any]:
        try:
            logger.info(f"Processing message with context: {context}")
            
            # Validate document_id
            document_id = context.get('document_id')
            if not document_id:
                raise ValueError("Document ID is required in context")

            # Get document content
            doc_info = await self.document_processor.get_document_content(document_id)
            if not doc_info:
                raise ValueError(f"Document not found: {document_id}")

            # Process the message
            response = await self.llm_client.analyze_document(
                query=message,
                context=doc_info.get('content', ''),
                document_type=doc_info.get('type', 'unknown')
            )

            return {
                "answer": response,
                "metadata": {
                    "document_id": document_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "connection_id": connection_id
                }
            }

        except Exception as e:
            logger.error(f"Error in legal handler: {str(e)}", exc_info=True)
            raise

    def _get_system_prompt(self, doc_type: str) -> str:
        """Get document type specific system prompt"""
        prompts = {
            "lease_agreement": """You are a concise lease analyzer. Provide brief, direct answers about:
- Parties
- Terms
- Rent
- Property
- Dates""",
            
            "tax_return": """You are a concise tax document analyzer. Focus only on:
- Tax amounts
- Filing status
- Refunds
- Key deductions""",
            
            "court_filing": """You are a concise legal analyst. State only:
- Case details
- Claims
- Relief sought
- Status""",
            
            "unknown": """You are a concise document analyst. Provide brief, factual responses without elaboration."""
        }
        return prompts.get(doc_type, prompts["unknown"])

    def _format_section(self, title: str, content: List[str], emoji: str = "") -> str:
        """Format a section with title and bullet points"""
        formatted_title = f"## {emoji} {title}" if emoji else f"## {title}"
        formatted_content = "\n".join([f"* **{item}**" if ":" in item 
                                     else f"* {item}" for item in content])
        return f"{formatted_title}\n\n{formatted_content}\n"

    def _construct_prompt(self, doc_info: Dict[str, Any], content: str, query: str, filename: str) -> str:
        """Construct document-specific prompt"""
        doc_type = doc_info['type']
        
        # Define sections dynamically based on document type
        sections = {
            "file_info": {
                "title": "File Information",
                "emoji": "📄",
                "content": [
                    f"Document Type: {doc_type}",
                    f"Filename: {filename}",
                    f"Upload Date: {doc_info.get('upload_date', 'Not available')}"
                ]
            },
            "document_analysis": {
                "title": "Document Analysis",
                "emoji": "📋",
                "content": [
                    f"Type: {doc_info.get('details', {}).get('type', 'Not specified')}",
                    f"Parties: {doc_info.get('details', {}).get('parties', 'Not specified')}",
                    f"Status: {doc_info.get('details', {}).get('status', 'Not specified')}"
                ]
            },
            "key_points": {
                "title": "Key Points",
                "emoji": "💡",
                "content": [point for point in doc_info.get('key_points', [])] or ["Analysis pending"]
            }
        }

        # Construct formatted prompt
        formatted_sections = [
            self._format_section(
                section["title"],
                section["content"],
                section["emoji"]
            )
            for section in sections.values()
        ]

        # Add the query
        prompt = "\n".join(formatted_sections) + f"\nQuestion: {query}\n\nPlease provide a clear, structured response using markdown formatting with:\n* Bold headers for sections\n* Bullet points for key information\n* Specific references to document content"

        return prompt

    async def handle_upload(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """Handle new document upload"""
        try:
            # Clear existing caches
            self.document_processor.clear_cache()
            if hasattr(self.rag_retriever, 'clear_cache'):
                self.rag_retriever.clear_cache()
            
            # Process new document
            return await self.document_processor.process_document(file_path, file_type)
            
        except Exception as e:
            logger.error(f"Error handling document upload: {e}")
            raise

    def _create_error_response(self, error_message: str, connection_id: str) -> Dict[str, Any]:
        """Create standardized error response"""
        return {
            "answer": error_message,
            "insights": {},
            "metadata": {
                "error": True,
                "connection_id": connection_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        }