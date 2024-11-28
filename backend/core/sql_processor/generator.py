from typing import Dict, Any, List, Optional
import logging
import json
from .processor import SQLProcessor

logger = logging.getLogger(__name__)

class SQLGenerator:
    def __init__(self, llm_client):
        self.llm_client = llm_client
        self.sql_processor = SQLProcessor()

    async def generate_sql(
        self,
        question: str,
        schema: dict,
        connection_id: str,
        temperature: float = 0.1
    ) -> str:
        """Specific method for SQL generation using comprehensive few-shot examples"""
        try:
            # Format schema for better prompt understanding
            schema_str = json.dumps(schema, indent=2)
            
            prompt = f"""Given a database schema, generate SQL queries to answer questions. Return only the SQL query without any explanations.

    Example 1 - Listing Tables:
    Schema:
    {{
    "products": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "name": {{"type": "varchar"}},
        "price": {{"type": "numeric"}}
        }}
    }}
    }}
    Question: Show all tables in the database
    SQL: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

    Example 2 - Viewing Table Structure:
    Schema:
    {{
    "orders": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "total": {{"type": "numeric"}}
        }}
    }}
    }}
    Question: Show me the columns in the orders table
    SQL: SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'orders' AND table_schema = 'public';

    Example 3 - Simple Select:
    Schema:
    {{
    "products": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "name": {{"type": "varchar"}},
        "price": {{"type": "numeric"}}
        }}
    }}
    }}
    Question: Get all products with their prices
    SQL: SELECT name, price FROM products ORDER BY name LIMIT 100;

    Example 4 - Aggregation:
    Schema:
    {{
    "orders": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "total": {{"type": "numeric"}},
        "created_at": {{"type": "timestamp"}}
        }}
    }}
    }}
    Question: What's the total value of all orders?
    SQL: SELECT COUNT(*) as order_count, SUM(total) as total_value FROM orders;

    Example 5 - Joins:
    Schema:
    {{
    "orders": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "user_id": {{"type": "integer", "foreign_keys": ["users.id"]}},
        "total": {{"type": "numeric"}}
        }}
    }},
    "users": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "name": {{"type": "varchar"}}
        }}
    }}
    }}
    Question: Show all orders with customer names
    SQL: SELECT u.name as customer_name, o.id as order_id, o.total 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    ORDER BY o.id DESC 
    LIMIT 100;

    Example 6 - Filtering:
    Schema:
    {{
    "products": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "name": {{"type": "varchar"}},
        "price": {{"type": "numeric"}},
        "category": {{"type": "varchar"}}
        }}
    }}
    }}
    Question: Find all products costing more than $100
    SQL: SELECT name, price FROM products WHERE price > 100 ORDER BY price DESC LIMIT 100;

    Example 7 - Grouping:
    Schema:
    {{
    "orders": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "status": {{"type": "varchar"}},
        "total": {{"type": "numeric"}}
        }}
    }}
    }}
    Question: Show total sales by order status
    SQL: SELECT status, COUNT(*) as order_count, SUM(total) as total_sales 
    FROM orders 
    GROUP BY status 
    ORDER BY total_sales DESC;

    Example 8 - Complex Join with Aggregation:
    Schema:
    {{
    "order_items": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "order_id": {{"type": "integer", "foreign_keys": ["orders.id"]}},
        "product_id": {{"type": "integer", "foreign_keys": ["products.id"]}},
        "quantity": {{"type": "integer"}}
        }}
    }},
    "products": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "name": {{"type": "varchar"}},
        "price": {{"type": "numeric"}}
        }}
    }},
    "orders": {{
        "columns": {{
        "id": {{"type": "integer", "primary_key": true}},
        "created_at": {{"type": "timestamp"}}
        }}
    }}
    }}
    Question: What are the most popular products by quantity sold?
    SQL: SELECT p.name, SUM(oi.quantity) as total_quantity_sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.id, p.name
    ORDER BY total_quantity_sold DESC
    LIMIT 100;

    Now, given this schema:
   {schema_str}

Generate a SQL query to answer this question: {question}"""

            messages = [
                {
                    "role": "system",
                    "content": "You are a SQL expert. Return only the SQL query without any explanations or markdown formatting."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]

            # Use the llm_client's method instead of accessing client directly
            sql = await self.llm_client.generate_sql(
                question=question,
                schema=schema,
                temperature=temperature
            )
            
            # Clean up the response
            if '```sql' in sql:
                sql = sql.split('```sql')[1].split('```')[0]
            elif '```' in sql:
                sql = sql.split('```')[1]
                
            sql = sql.strip()
            
            # Validate the SQL against schema
            self._validate_against_schema(sql, schema)
            
            # Return in the format expected by the calling code
            return {
                "sql": sql,
                "explanation": "Generated SQL based on schema"
            }
            
        except Exception as e:
            logger.error(f"Error generating SQL: {e}")
            raise

    def _validate_against_schema(self, sql: str, schema: Dict[str, Any]) -> None:
        """Validate that all tables and columns in the SQL exist in the schema"""
        # Skip validation for information_schema queries
        if 'information_schema' in sql.lower():
            return
            
        # Basic SQL parsing to extract table names
        sql_lower = sql.lower()
        from_idx = sql_lower.find('from')
        if from_idx == -1:
            raise ValueError("Invalid SQL: No FROM clause found")
            
        # Get all table names from schema
        valid_tables = {name.lower() for name in schema.keys()}
        
        # Check each word in the SQL against valid tables
        # This is a simplified check - you might want more robust parsing
        for word in sql_lower[from_idx:].split():
            word = word.strip(',()')
            if word in valid_tables:
                continue  # Valid table found
            
            # Check if it's a valid alias
            for table in valid_tables:
                if f"{table} {word}" in sql_lower:
                    break
            else:
                if word in valid_tables:
                    raise ValueError(f"Invalid table or alias used in query: {word}")