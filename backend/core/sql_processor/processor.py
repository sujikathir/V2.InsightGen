# File Path: smallbusiness/backend/core/sql_processor/processor.py

from typing import Dict, Any, List, Optional, Tuple
import sqlalchemy
from sqlalchemy import create_engine, text, MetaData
import pandas as pd
import logging
from sqlalchemy.engine import Engine
from sqlalchemy.sql import select
from sqlalchemy.exc import SQLAlchemyError
import re
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from decimal import Decimal

logger = logging.getLogger(__name__)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return str(obj)
        return super().default(obj)

class SQLProcessor:
    _instance = None
    _lock = asyncio.Lock()
    _connections = {}
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SQLProcessor, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not SQLProcessor._initialized:
            print("Initializing SQLProcessor")
            self._executor = ThreadPoolExecutor(max_workers=4)
            SQLProcessor._initialized = True

    async def connect_database(self, connection_id: str, connection_string: str) -> bool:
        try:
            async with self._lock:
                if connection_id in SQLProcessor._connections:
                    return True

                engine = create_engine(connection_string)
                
                # Test connection
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                
                SQLProcessor._connections[connection_id] = engine
                print(f"Connection successful. Connections: {SQLProcessor._connections}")
                return True
                
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise

    async def reflect_database(self, connection_id: str) -> Dict[str, Any]:
        try:
            if connection_id not in SQLProcessor._connections:
                raise ValueError(f"No connection found for ID: {connection_id}")
                
            engine = SQLProcessor._connections[connection_id]
            metadata = MetaData()
            
            def _reflect():
                metadata.reflect(bind=engine)
                tables = {}
                for table_name, table in metadata.tables.items():
                    columns = {}
                    for column in table.columns:
                        columns[column.name] = {
                            'type': str(column.type),
                            'primary_key': column.primary_key,
                            'foreign_keys': [fk.target_fullname for fk in column.foreign_keys],
                            'nullable': column.nullable
                        }
                    tables[table_name] = {
                        'columns': columns,
                        'primary_key': [key.name for key in table.primary_key],
                        'foreign_keys': [
                            {'source': fk.parent.name, 'target': fk.target_fullname}
                            for fk in table.foreign_keys
                        ]
                    }
                return tables
                
            return await asyncio.get_event_loop().run_in_executor(
                self._executor, _reflect
            )
            
        except Exception as e:
            logger.error(f"Database reflection error: {e}")
            raise

    def _validate_query(self, query: str) -> bool:
        """
        Validates if the SQL query is safe to execute.
        Basic validation to prevent dangerous operations.
        """
        if not query:
            return False
        
        # Clean the query: remove leading/trailing whitespace and convert to lowercase
        query = ' '.join(query.lower().split())
        logger.info(f"Validating cleaned query: {query}")
        
        # List of forbidden keywords that could be dangerous
        forbidden_keywords = [
            'drop', 'truncate', 'delete', 'update', 'insert',
            'alter', 'create', 'replace', 'exec', 'execute'
        ]
        
        # Check for forbidden keywords
        for keyword in forbidden_keywords:
            if keyword in query.split():
                logger.warning(f"Forbidden keyword found in query: {keyword}")
                return False
            
        # Only allow SELECT statements - now handles whitespace better
        if not query.lstrip().startswith(('select ', 'with ')):
            logger.warning("Query must start with SELECT or WITH")
            return False
        
        return True

    async def execute_query(
        self,
        connection_id: str,
        query: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        try:
            if not self._validate_query(query):
                raise ValueError("Invalid or unsafe query")
            
            if connection_id not in self._connections:
                raise ValueError(f"No connection found for ID: {connection_id}")
                
            engine = self._connections[connection_id]
            
            def _execute():
                with engine.connect() as connection:
                    result = connection.execute(text(query), params or {})
                    columns = result.keys()
                    rows = []
                    for row in result:
                        # Convert row to dict and handle serialization
                        row_dict = {}
                        for col in columns:
                            value = getattr(row, col)
                            if isinstance(value, datetime):
                                value = value.isoformat()
                            elif isinstance(value, Decimal):
                                value = str(value)
                            row_dict[col] = value
                        rows.append(row_dict)
                    
                    metadata = {
                        "row_count": len(rows),
                        "column_names": list(columns)
                    }
                    return rows, metadata
                    
            return await asyncio.get_event_loop().run_in_executor(
                self._executor, _execute
            )
            
        except Exception as e:
            logger.error(f"Query execution error: {e}")
            raise