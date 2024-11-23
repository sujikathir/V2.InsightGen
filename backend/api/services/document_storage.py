# backend/api/services/document_storage.py
from typing import Dict, Any, Optional
import motor.motor_asyncio
import logging

logger = logging.getLogger(__name__)

class DocumentStorage:
    def __init__(self):
        # Initialize MongoDB connection
        self.client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
        self.db = self.client.documents_db
        self.collection = self.db.documents

    async def save_document(
        self,
        content: Dict[str, Any],
        file_path: str,
        file_type: str,
        metadata: Dict[str, Any]
    ) -> None:
        """Save document content and metadata to storage"""
        try:
            # Use the UUID as a string ID
            document = {
                "_id": metadata.get('id'),  # Use the UUID string directly
                "content": content,
                "file_path": file_path,
                "file_type": file_type,
                "metadata": metadata
            }
            await self.collection.insert_one(document)
        except Exception as e:
            logger.error(f"Error saving document: {e}")
            raise

    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve document by ID"""
        try:
            # Query using the string ID directly
            document = await self.collection.find_one({"_id": document_id})
            return document
        except Exception as e:
            logger.error(f"Error retrieving document: {e}")
            raise

    async def update_document_analysis(
        self,
        document_id: str,
        analysis_result: Dict[str, Any]
    ) -> None:
        """Update document with analysis results"""
        try:
            await self.collection.update_one(
                {"_id": document_id},
                {"$set": {"analysis": analysis_result}}
            )
        except Exception as e:
            logger.error(f"Error updating document analysis: {e}")
            raise