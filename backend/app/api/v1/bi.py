"""
BI Analytics API endpoints

Provides pre-built BI queries for the Clinical Audit Dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_current_user
from app.schemas.auth import UserResponse
from app.schemas.query import QueryRequest, QueryResponse
from app.services.athena_service import AthenaService
from app.services.bi_query_service import BIQueryService
from app.services.query_service import QueryService
import logging
from typing import Literal

router = APIRouter(prefix="/bi", tags=["bi-analytics"])
logger = logging.getLogger(__name__)

# Initialize services
athena_service = AthenaService()
bi_query_service = BIQueryService()
query_service = QueryService()


@router.get("/query/{query_type}", response_model=QueryResponse)
async def execute_bi_query(
    query_type: Literal[
        "total_sessions",
        "sessions_by_status",
        "sessions_trend",
        "top_tenants",
        "top_practitioners",
        "audit_trail",
        "unsigned_notes",
        "unsigned_notes_count",
        "weekly_summary",
        "daily_active_users",
        "service_usage_tenant",
        "note_format_usage",
    ],
    tenant_id: str | None = Query(None, description="Tenant ID (required for most queries)"),
    user_id: str | None = Query(None, description="User ID (optional filter)"),
    start_date: str | None = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: str | None = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(1000, ge=1, le=10000, description="Result limit"),
    current_user: UserResponse = Depends(get_current_user),
) -> QueryResponse:
    """
    Execute a pre-built BI query
    
    Args:
        query_type: Type of BI query to execute
        tenant_id: Tenant ID (required for tenant-scoped queries)
        user_id: User ID filter (optional)
        start_date: Start date for date range
        end_date: End date for date range
        limit: Maximum number of rows to return
        current_user: Current authenticated user
        
    Returns:
        QueryResponse with results
    """
    try:
        # Build query based on type
        if query_type == "total_sessions":
            query = bi_query_service.get_total_sessions(start_date, end_date)
        elif query_type == "sessions_by_status":
            query = bi_query_service.get_sessions_by_status(start_date, end_date)
        elif query_type == "sessions_trend":
            query = bi_query_service.get_sessions_trend(start_date, end_date)
        elif query_type == "top_tenants":
            query = bi_query_service.get_top_tenants(start_date, end_date)
        elif query_type == "top_practitioners":
            if not tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="tenant_id is required for top_practitioners query"
                )
            query = bi_query_service.get_top_practitioners(tenant_id, start_date, end_date)
        elif query_type == "audit_trail":
            query = bi_query_service.get_audit_trail(tenant_id, start_date, end_date, user_id, limit)
        elif query_type == "unsigned_notes":
            if not tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="tenant_id is required for unsigned_notes query"
                )
            query = bi_query_service.get_unsigned_notes(tenant_id, start_date, end_date, limit)
        elif query_type == "unsigned_notes_count":
            if not tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="tenant_id is required for unsigned_notes_count query"
                )
            query = bi_query_service.get_unsigned_notes_count(tenant_id, start_date, end_date)
        elif query_type == "weekly_summary":
            if not tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="tenant_id is required for weekly_summary query"
                )
            query = bi_query_service.get_weekly_summary(tenant_id, start_date, end_date)
        elif query_type == "daily_active_users":
            if not tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="tenant_id is required for daily_active_users query"
                )
            query = bi_query_service.get_daily_active_users(tenant_id, start_date, end_date)
        elif query_type == "service_usage_tenant":
            if not tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="tenant_id is required for service_usage_tenant query"
                )
            query = bi_query_service.get_service_usage_by_tenant(tenant_id, start_date, end_date)
        elif query_type == "note_format_usage":
            if not tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="tenant_id is required for note_format_usage query"
                )
            query = bi_query_service.get_note_format_usage(tenant_id, start_date, end_date)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown query type: {query_type}"
            )
        
        # Validate query
        is_valid, error_message = query_service.validate_query(query)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message or "Invalid query"
            )
        
        # Execute query
        logger.info(f"Executing BI query '{query_type}' for user {current_user.username}")
        result = await athena_service.execute_query(query=query)
        
        # Extract columns
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
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"BI query execution error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query execution failed: {str(e)}",
        )


@router.get("/queries")
async def list_available_queries(
    current_user: UserResponse = Depends(get_current_user),
) -> dict:
    """
    List all available BI queries with descriptions
    """
    return {
        "queries": [
            {
                "type": "total_sessions",
                "name": "Total Sessions Overview",
                "description": "Get total sessions, tenants, and users count",
                "requires_tenant": False,
            },
            {
                "type": "sessions_by_status",
                "name": "Sessions by Status",
                "description": "Count of sessions grouped by status (IN_PROGRESS, COMPLETED, SIGNED, etc.)",
                "requires_tenant": False,
            },
            {
                "type": "sessions_trend",
                "name": "Daily Sessions Trend",
                "description": "Daily session count over time",
                "requires_tenant": False,
            },
            {
                "type": "top_tenants",
                "name": "Top Tenants",
                "description": "Top 10 tenants by session count",
                "requires_tenant": False,
            },
            {
                "type": "top_practitioners",
                "name": "Top Practitioners",
                "description": "Top practitioners within a tenant by session count",
                "requires_tenant": True,
            },
            {
                "type": "audit_trail",
                "name": "Audit Trail",
                "description": "Detailed event log for compliance and tracking",
                "requires_tenant": True,
            },
            {
                "type": "unsigned_notes",
                "name": "Unsigned Notes",
                "description": "Notes awaiting practitioner signature",
                "requires_tenant": True,
            },
            {
                "type": "unsigned_notes_count",
                "name": "Unsigned Notes Count",
                "description": "Count of unsigned notes",
                "requires_tenant": True,
            },
            {
                "type": "weekly_summary",
                "name": "Weekly Summary",
                "description": "Week-over-week usage trends by tenant",
                "requires_tenant": True,
            },
            {
                "type": "daily_active_users",
                "name": "Daily Active Users",
                "description": "Daily active user count (DAU) over time",
                "requires_tenant": True,
            },
            {
                "type": "service_usage_tenant",
                "name": "Service Usage by Tenant",
                "description": "Service usage analytics for a tenant",
                "requires_tenant": True,
            },
            {
                "type": "note_format_usage",
                "name": "Note Format Usage",
                "description": "Usage statistics by note format (GIRPP, SOAP, etc.)",
                "requires_tenant": True,
            },
        ]
    }
