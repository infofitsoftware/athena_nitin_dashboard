import re
from typing import Any


class QueryService:
    """Service for query validation and construction"""
    
    # Allowed SQL keywords (whitelist approach for security)
    ALLOWED_KEYWORDS = {
        'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
        'LIMIT', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
        'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS NULL',
        'IS NOT NULL', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'DISTINCT',
        'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    }
    
    # Dangerous keywords to block
    DANGEROUS_KEYWORDS = {
        'DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE',
        'TRUNCATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE',
    }
    
    @classmethod
    def validate_query(cls, query: str) -> tuple[bool, str | None]:
        """
        Validate SQL query for security
        
        Args:
            query: SQL query string
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not query or not query.strip():
            return False, "Query cannot be empty"
        
        query_upper = query.upper().strip()
        
        # Check for dangerous keywords
        for dangerous in cls.DANGEROUS_KEYWORDS:
            if dangerous in query_upper:
                return False, f"Query contains forbidden keyword: {dangerous}"
        
        # Basic SQL injection prevention - check for suspicious patterns
        suspicious_patterns = [
            r';\s*(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE)',
            r'--',  # SQL comments
            r'/\*.*?\*/',  # Multi-line comments
            r"';",  # SQL injection attempt
            r"';--",
            r"UNION.*SELECT",
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, query_upper, re.IGNORECASE | re.DOTALL):
                return False, "Query contains potentially dangerous SQL patterns"
        
        # Must start with SELECT
        if not query_upper.startswith('SELECT'):
            return False, "Only SELECT queries are allowed"
        
        return True, None
    
    @classmethod
    def sanitize_query(cls, query: str) -> str:
        """
        Sanitize query (remove extra whitespace, normalize)
        
        Args:
            query: Raw query string
            
        Returns:
            Sanitized query string
        """
        # Remove leading/trailing whitespace
        query = query.strip()
        
        # Normalize whitespace
        query = re.sub(r'\s+', ' ', query)
        
        return query
    
    @classmethod
    def construct_query(
        cls,
        table: str,
        columns: list[str] | None = None,
        filters: dict[str, Any] | None = None,
        limit: int | None = None,
    ) -> str:
        """
        Construct a SELECT query from parameters
        
        Args:
            table: Table name
            columns: List of column names (None for *)
            filters: Dictionary of filter conditions
            limit: Maximum number of rows
            
        Returns:
            SQL query string
        """
        # Build SELECT clause
        if columns:
            # Sanitize column names
            safe_columns = [f'"{col}"' for col in columns]
            select_clause = f"SELECT {', '.join(safe_columns)}"
        else:
            select_clause = "SELECT *"
        
        # Build FROM clause
        from_clause = f'FROM "{table}"'
        
        # Build WHERE clause
        where_clause = ""
        if filters:
            conditions = []
            for key, value in filters.items():
                if isinstance(value, str):
                    conditions.append(f'"{key}" = \'{value}\'')
                elif isinstance(value, (int, float)):
                    conditions.append(f'"{key}" = {value}')
                elif isinstance(value, list):
                    # IN clause
                    values = ', '.join([f"'{v}'" if isinstance(v, str) else str(v) for v in value])
                    conditions.append(f'"{key}" IN ({values})')
            if conditions:
                where_clause = f"WHERE {' AND '.join(conditions)}"
        
        # Build LIMIT clause
        limit_clause = ""
        if limit:
            limit_clause = f"LIMIT {limit}"
        
        # Combine query
        query_parts = [select_clause, from_clause]
        if where_clause:
            query_parts.append(where_clause)
        if limit_clause:
            query_parts.append(limit_clause)
        
        return ' '.join(query_parts)
