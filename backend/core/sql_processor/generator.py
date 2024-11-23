# File Path: insightgen/backend/core/sql_processor/generator.py

from typing import Dict, Any, List, Optional
import logging
from core.sql_processor.processor import SQLProcessor
import json
import re

logger = logging.getLogger(__name__)

class SQLGenerator:
    def __init__(self, llm_client):
        self.llm_client = llm_client
        self.sql_processor = SQLProcessor()

    async def generate_sql(self, question: str, connection_id: str) -> Dict[str, str]:
        try:
            # Get database schema
            schema = await self.sql_processor.reflect_database(connection_id)
            
            # Create prompt for SQL generation
            prompt = f"""Given the following database schema:
{json.dumps(schema, indent=2)}

Generate a SQL SELECT query to answer this question: {question}

IMPORTANT: Return ONLY the SQL query without any explanations or additional text.
The query must:
1. Start with SELECT
2. Use proper table aliases
3. Include appropriate JOINs if needed
4. End with a semicolon
5. For general "what data is present" questions, show a sample of records from main tables

Example response format:
SELECT 
    p.product_id,
    p.name as product_name,
    p.price,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LIMIT 10;"""
            
            # Get response from LLM
            response = await self.llm_client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[
                    {"role": "system", "content": "You are a SQL expert. Generate SQL queries based on natural language questions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            sql = response.choices[0].message.content
            
            # Extract SQL from response (assuming it's wrapped in ```sql blocks)
            sql = self._extract_sql(sql)
            
            return {
                "sql": sql,
                "explanation": "SQL query generated based on the question"
            }
            
        except Exception as e:
            logger.error(f"SQL generation error: {e}")
            raise

    async def execute_generated_sql(self, connection_id: str, generated_sql: Dict[str, str]) -> Dict[str, Any]:
        try:
            if not generated_sql or not generated_sql.get("sql"):
                raise ValueError("No SQL query provided")
                
            results, metadata = await self.sql_processor.execute_query(
                connection_id=connection_id,
                query=generated_sql["sql"]
            )
            
            return {
                "results": results,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"SQL execution error: {e}")
            raise

    def _create_sql_prompt(self, question: str, schema: Dict[str, Any]) -> str:
        return f"""Given the following database schema:
{json.dumps(schema, indent=2)}

Generate a SQL query to answer this question: {question}

Return only the SQL query wrapped in ```sql blocks."""

    def _extract_sql(self, response: str) -> str:
        """Extract clean SQL from LLM response"""
        # First try to extract SQL between ```sql blocks
        sql_match = re.search(r"```sql\n(.*?)\n```", response, re.DOTALL)
        if sql_match:
            sql = sql_match.group(1).strip()
        else:
            # If no SQL blocks found, use the whole response
            sql = response.strip()
        
        # Clean up the SQL
        sql = ' '.join(sql.split()).strip()
        
        # Ensure it starts with SELECT
        if not sql.lower().startswith(('select', 'with')):
            raise ValueError("Generated SQL must start with SELECT or WITH")
        
        logger.info(f"Extracted SQL: {sql}")
        return sql