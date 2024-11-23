# backend/api/services/document_service.py
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
            document = await self.collection.find_one({"_id": ObjectId(document_id)})
            if not document:
                raise ValueError(f"Document not found: {document_id}")
            return document.get("content")
        except Exception as e:
            logger.error(f"Error retrieving document: {e}")
            raise

    async def get_document_metadata(self, document_id: str) -> Optional[Dict[str, Any]]:
        try:
            document = await self.collection.find_one({"_id": ObjectId(document_id)})
            if not document:
                raise ValueError(f"Document not found: {document_id}")
            return {
                "filename": document.get("filename"),
                "file_type": document.get("file_type"),
                "upload_date": document.get("upload_date"),
                "size": document.get("size"),
                "metadata": document.get("metadata", {})
            }
        except Exception as e:
            logger.error(f"Error retrieving document metadata: {e}")
            raise