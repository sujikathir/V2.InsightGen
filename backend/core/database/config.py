# backend/core/database/config.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

class Database:
    client = None
    db = None

    async def connect_mongodb(self):
        try:
            self.client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
            self.db = self.client[os.getenv("MONGODB_DB_NAME", "smallbusiness")]
            await self.db.command('ping')
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"MongoDB connection error: {e}")
            raise

    async def close_mongodb(self):
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection")

db = Database()