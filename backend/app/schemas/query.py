from pydantic import BaseModel, Field
from typing import Any


class QueryRequest(BaseModel):
    """Query request schema"""
    query: str = Field(..., description="SQL query string")
    database: str | None = Field(None, description="Database name (optional, uses config default)")
    limit: int | None = Field(None, ge=1, le=10000, description="Maximum number of rows to return")


class QueryResultRow(BaseModel):
    """Single row of query results"""
    data: dict[str, Any] = Field(..., description="Row data as key-value pairs")


class QueryResponse(BaseModel):
    """Query response schema"""
    query_execution_id: str
    status: str
    data_scanned_bytes: int
    execution_time_ms: int
    row_count: int
    columns: list[str]
    results: list[dict[str, Any]] = Field(..., description="Query results as list of dictionaries")
