from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.schemas.auth import UserResponse
from app.schemas.query import QueryRequest, QueryResponse
from app.services.athena_service import AthenaService
from app.services.query_service import QueryService
import logging

router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)

# Initialize Athena service
athena_service = AthenaService()


@router.post("/query", response_model=QueryResponse)
async def execute_query(
    query_request: QueryRequest,
    current_user: UserResponse = Depends(get_current_user),
) -> QueryResponse:
    """
    Execute an Athena query
    
    Args:
        query_request: Query request with SQL query
        current_user: Current authenticated user
        
    Returns:
        QueryResponse with results
        
    Raises:
        HTTPException: If query is invalid or execution fails
    """
    # Sanitize query
    sanitized_query = QueryService.sanitize_query(query_request.query)
    
    # Validate query
    is_valid, error_message = QueryService.validate_query(sanitized_query)
    if not is_valid:
        logger.warning(f"Invalid query from user {current_user.username}: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message or "Invalid query",
        )
    
    # Apply limit if specified
    if query_request.limit:
        # Add LIMIT clause if not present
        query_upper = sanitized_query.upper()
        if 'LIMIT' not in query_upper:
            sanitized_query = f"{sanitized_query} LIMIT {query_request.limit}"
    
    try:
        # Log query execution
        logger.info(f"Executing query for user {current_user.username}: {sanitized_query[:100]}...")
        
        # Execute query
        result = await athena_service.execute_query(
            query=sanitized_query,
            database=query_request.database,
        )
        
        # Extract columns from first row if results exist
        columns = []
        if result['results']:
            columns = list(result['results'][0].keys())
        
        # Build response
        response = QueryResponse(
            query_execution_id=result['query_execution_id'],
            status=result['status'],
            data_scanned_bytes=result['data_scanned_bytes'],
            execution_time_ms=result['execution_time_ms'],
            row_count=len(result['results']),
            columns=columns,
            results=result['results'],
        )
        
        logger.info(
            f"Query completed for user {current_user.username}: "
            f"{response.row_count} rows, {response.execution_time_ms}ms"
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Query execution error for user {current_user.username}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query execution failed: {str(e)}",
        )
