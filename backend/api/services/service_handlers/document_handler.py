# backend/api/services/service_handlers/document_handler.py
from typing import Dict, Any, List, Optional
from ..base_service import BaseService
from core.document_processor.processor import DocumentProcessor
from ..chat_service import ChatService
from ..document_storage import DocumentStorage
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class DocumentHandler(BaseService):
    def __init__(self):
        super().__init__()
        self.doc_processor = DocumentProcessor()
        self.chat_service = ChatService()
        self.storage = DocumentStorage()

    async def initialize_chat(self) -> None:
        """Implementation of abstract method from BaseService"""
        # Initialize any chat-specific setup here
        pass

    async def process_message(
        self,
        message: str,
        context: Dict[str, Any],
        chat_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        try:
            document_id = context.get('document_id')
            if not document_id:
                raise ValueError("Document ID is required")

            # First process the document if it's a new upload
            if context.get('file_path'):
                # Process new document
                document_content = await self.doc_processor.process_document(
                    file_path=context.get('file_path'),
                    file_type=context.get('file_type', 'txt'),
                    extraction_type='text'
                )
                
                # Save to storage if it's a new document
                await self.storage.save_document(
                    content=document_content,
                    file_path=context.get('file_path'),
                    file_type=context.get('file_type', 'txt'),
                    metadata={
                        "processed_at": datetime.utcnow(),
                        "source": context.get('source', 'upload'),
                        "service_type": context.get('service_type', 'general')
                    }
                )
            else:
                # Get existing document content
                document_content = await self._get_document_content(document_id)
                if not document_content:
                    raise ValueError(f"Document not found: {document_id}")

            # Process with chat service for analysis
            chat_response = await self.chat_service.process_chat(
                query=message,
                mode='document',
                document_id=document_id,
                chat_history=chat_history
            )

            # Combine document insights with chat response
            response = {
                "answer": chat_response.get("answer", ""),
                "content": document_content.get("content", ""),
                "metadata": document_content.get("metadata", {}),
                "insights": {
                    "summary": document_content.get("analysis", {}).get("summary", ""),
                    "key_points": document_content.get("analysis", {}).get("key_points", []),
                    "entities": document_content.get("analysis", {}).get("entities", []),
                    "chat_insights": chat_response.get("insights", {})
                },
                "relevant_sections": await self._extract_relevant_sections(
                    document_content.get("content", ""),
                    message
                ),
                "source_metadata": {
                    "document_id": document_id,
                    "file_type": context.get('file_type'),
                    "processed_at": document_content.get("metadata", {}).get("processed_at")
                }
            }

            # Add format-specific data
            if context.get('file_type') in ['csv', 'xlsx']:
                response["data_analysis"] = {
                    "statistics": document_content.get("statistics", {}),
                    "preview": document_content.get("preview", {})
                }
            elif context.get('file_type') in ['docx', 'pdf']:
                response["document_structure"] = {
                    "sections": document_content.get("structure", {}),
                    "tables": document_content.get("tables", [])
                }

            # Store the chat interaction
            await self._store_chat_interaction(document_id, message, response)

            return response

        except Exception as e:
            logger.error(f"Error in document handler: {e}")
            raise Exception(f"Error processing document query: {str(e)}")

    async def upload_document(
        self,
        file_path: str,
        file_type: str,
        metadata: Dict[str, Any] = None
    ) -> str:
        """Upload and process a new document"""
        try:
            # Process document
            document_content = await self.doc_processor.process_document(
                file_path=file_path,
                file_type=file_type,
                extraction_type='text'
            )

            # Save to storage
            document_id = await self.storage.save_document(
                content=document_content,
                file_path=file_path,
                file_type=file_type,
                metadata={
                    "processed_at": datetime.utcnow(),
                    **(metadata or {})
                }
            )

            return document_id

        except Exception as e:
            logger.error(f"Error uploading document: {e}")
            raise

    async def _get_document_content(self, document_id: str) -> Dict[str, Any]:
        """
        Retrieve processed document content from storage
        """
        try:
            document = await self.storage.get_document(document_id)
            if not document:
                return {}
                
            # If the document exists but content needs to be reprocessed
            if not document.get("content") and document.get("file_path"):
                document_content = await self.doc_processor.process_document(
                    file_path=document["file_path"],
                    file_type=document["file_type"],
                    extraction_type='text'
                )
                
                # Update storage with processed content
                await self.storage.update_document(
                    document_id=document_id,
                    updates={
                        "content": document_content.get("content"),
                        "analysis": document_content.get("analysis"),
                        "metadata": {
                            **document.get("metadata", {}),
                            "reprocessed_at": datetime.utcnow()
                        }
                    }
                )
                
                return document_content
                
            return document

        except Exception as e:
            logger.error(f"Error retrieving document content: {e}")
            raise

    async def _extract_relevant_sections(
        self,
        content: str,
        query: str
    ) -> List[Dict[str, Any]]:
        """
        Extract sections of the document relevant to the query
        """
        try:
            # Split content into sections (paragraphs or logical chunks)
            sections = [s.strip() for s in content.split('\n\n') if s.strip()]
            
            relevant_sections = []
            for section in sections:
                # Simple relevance scoring based on keyword matching
                # In production, use proper embedding similarity
                relevance_score = sum(
                    word.lower() in section.lower() 
                    for word in query.split()
                ) / len(query.split())
                
                if relevance_score > 0:
                    relevant_sections.append({
                        "content": section[:500] + "..." if len(section) > 500 else section,
                        "relevance_score": relevance_score
                    })
            
            # Sort by relevance and return top 3
            return sorted(
                relevant_sections,
                key=lambda x: x["relevance_score"],
                reverse=True
            )[:3]

        except Exception as e:
            logger.error(f"Error extracting relevant sections: {e}")
            return []

    async def _store_chat_interaction(
        self,
        document_id: str,
        query: str,
        response: Dict[str, Any]
    ) -> None:
        """Store chat interaction for future reference"""
        try:
            interaction = {
                "document_id": document_id,
                "query": query,
                "response": {
                    "answer": response.get("answer"),
                    "insights": response.get("insights"),
                    "relevant_sections": response.get("relevant_sections")
                },
                "timestamp": datetime.utcnow()
            }
            
            await self.storage.store_interaction(interaction)

        except Exception as e:
            logger.error(f"Error storing chat interaction: {e}")
            # Don't raise exception as this is not critical
            pass

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and its associated data"""
        try:
            return await self.storage.delete_document(document_id)
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            raise

    async def process_document(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """Process a document and return its analysis"""
        try:
            logger.info(f"Processing document: {file_path}")
            
            # Generate a unique document ID
            document_id = str(uuid.uuid4())
            
            # Extract text content from the PDF
            if file_type.lower() == 'pdf':
                import PyPDF2
                
                text_content = ""
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        text_content += page.extract_text()
            else:
                # Handle other file types or use your existing document processor
                text_content = await self.doc_processor.process_document(
                    file_path=file_path,
                    file_type=file_type,
                    extraction_type='text'
                )

            # Prepare content for storage
            document_content = {
                "text": text_content,
                "file_type": file_type,
                "processed_at": datetime.utcnow().isoformat()
            }

            # Save to storage
            metadata = {
                "id": document_id,
                "processed_at": datetime.utcnow(),
                "source": "upload",
                "status": "processed",
                "file_type": file_type
            }

            await self.storage.save_document(
                content=document_content,
                file_path=file_path,
                file_type=file_type,
                metadata=metadata
            )

            return {
                "id": document_id,
                "summary": "",  # Will be filled in during analysis
                "key_metrics": [],
                "metadata": {
                    "file_type": file_type,
                    "processed_at": datetime.utcnow().isoformat(),
                    "status": "processed"
                }
            }

        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise Exception(f"Error processing document: {str(e)}")

    async def analyze_document(self, document_id: str) -> Dict[str, Any]:
        """Analyze a document and extract insights"""
        try:
            # Get document content
            document = await self.storage.get_document(document_id)
            if not document:
                raise ValueError(f"Document not found: {document_id}")

            content = document.get('content', {}).get('text', '')
            
            # Generate summary
            summary = await self._generate_summary(content)
            
            # Extract key points
            key_points = await self._extract_key_points(content)
            
            # Extract entities
            entities = await self._extract_entities(content)
            
            # Detect document type
            doc_type = await self._detect_document_type(content)
            
            return {
                "document_id": document_id,
                "analysis": {
                    "summary": summary,
                    "key_points": key_points,
                    "entities": entities,
                    "document_type": doc_type
                }
            }
        except Exception as e:
            logger.error(f"Error analyzing document: {e}")
            raise

    async def _generate_summary(self, content: str) -> str:
        try:
            response = await self.chat_service.process_chat(
                query="Please provide a concise summary of this document.",
                document_content=content,
                mode="document_chat"
            )
            return response.get("answer", "")
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return ""

    async def _extract_key_points(self, content: str) -> List[str]:
        try:
            response = await self.chat_service.process_chat(
                query="What are the key points in this document?",
                document_content=content,
                mode="document_chat"
            )
            return response.get("answer", "").split("\n")
        except Exception as e:
            logger.error(f"Error extracting key points: {e}")
            return []

    async def _extract_entities(self, content: str) -> Dict[str, List[str]]:
        try:
            response = await self.chat_service.process_chat(
                query="Extract important entities (people, organizations, dates, locations) from this document.",
                document_content=content,
                mode="document_chat"
            )
            return {"entities": response.get("answer", "").split("\n")}
        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return {"entities": []}

    async def _detect_document_type(self, content: str) -> str:
        try:
            response = await self.chat_service.process_chat(
                query="What type of legal document is this?",
                document_content=content,
                mode="document_chat"
            )
            return response.get("answer", "Unknown")
        except Exception as e:
            logger.error(f"Error detecting document type: {e}")
            return "Unknown"

    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a document by its ID
        """
        try:
            logger.info(f"Retrieving document: {document_id}")
            document = await self.storage.get_document(document_id)
            
            if not document:
                logger.warning(f"Document not found: {document_id}")
                return None

            # Return the document with its content and metadata
            return {
                "id": document.get("_id"),
                "content": document.get("content", {}),
                "metadata": document.get("metadata", {}),
                "analysis": document.get("analysis", {}),
                "file_type": document.get("file_type"),
                "file_path": document.get("file_path")
            }

        except Exception as e:
            logger.error(f"Error retrieving document: {e}")
            raise Exception(f"Error retrieving document: {str(e)}")