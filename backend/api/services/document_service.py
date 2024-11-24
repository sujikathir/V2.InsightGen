from typing import Optional, Dict, Any
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self):
        self.client = AsyncIOMotorClient("mongodb://localhost:27017")
        self.db = self.client.smallbusiness
        self.collection = self.db.documents

    async def get_document_content(self, document_id: str) -> Optional[Dict[str, Any]]:
        try:
            logger.info(f"Retrieving document content for ID: {document_id}")
            document = await self.collection.find_one({"_id": ObjectId(document_id)})
            
            if not document:
                logger.error(f"Document not found: {document_id}")
                raise ValueError(f"Document not found: {document_id}")

            content = document.get("content")
            if not content:
                logger.error(f"No content found in document: {document_id}")
                logger.debug(f"Document structure: {document}")
                return {}

            logger.info(f"Successfully retrieved content. Length: {len(str(content))}")
            logger.debug(f"Document content preview: {str(content)[:500]}")
            return content

        except Exception as e:
            logger.error(f"Error retrieving document: {e}")
            raise

    async def get_document_metadata(self, document_id: str) -> Optional[Dict[str, Any]]:
        try:
            logger.info(f"Retrieving metadata for document ID: {document_id}")
            document = await self.collection.find_one({"_id": ObjectId(document_id)})
            
            if not document:
                logger.error(f"Document not found: {document_id}")
                raise ValueError(f"Document not found: {document_id}")

            metadata = {
                "filename": document.get("filename"),
                "file_type": document.get("file_type"),
                "upload_date": document.get("upload_date"),
                "size": document.get("size"),
                "metadata": document.get("metadata", {}),
                "raw_content_length": len(str(document.get("content", "")))
            }
            
            logger.info(f"Retrieved metadata: {metadata}")
            return metadata

        except Exception as e:
            logger.error(f"Error retrieving document metadata: {e}")
            raise

    async def save_document(self, content: str, file_path: str, file_type: str) -> str:
        """Save document content to MongoDB"""
        try:
            logger.info(f"Saving document: {file_path}, type: {file_type}")
            
            document = {
                "content": content,
                "file_path": file_path,
                "file_type": file_type,
                "filename": file_path.split("/")[-1],
                "metadata": {
                    "content_length": len(content) if isinstance(content, str) else 0,
                    "file_type": file_type
                }
            }
            
            result = await self.collection.insert_one(document)
            logger.info(f"Document saved with ID: {result.inserted_id}")
            
            return str(result.inserted_id)

        except Exception as e:
            logger.error(f"Error saving document: {e}")
            raise

    async def check_document_exists(self, document_id: str) -> bool:
        """Check if a document exists in MongoDB"""
        try:
            count = await self.collection.count_documents({"_id": ObjectId(document_id)})
            return count > 0
        except Exception as e:
            logger.error(f"Error checking document existence: {e}")
            return False