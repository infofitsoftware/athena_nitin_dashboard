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

# All supported query types
QueryType = Literal[
    "total_sessions",
    "sessions_by_status",
    "sessions_trend",
    "top_tenants",
    "top_practitioners",
    "audit_trail",
    "unsigned_notes",
    "unsigned_notes_count",
    "unsigned_notes_by_practitioner",
    "weekly_summary",
    "weekly_summary_by_tenant",
    "daily_active_users",
    "monthly_active_users",
    "growth_metrics",
    "service_usage_tenant",
    "service_usage_practitioner",
    "service_usage_patient",
    "note_format_usage",
    "events_by_type",
]

# Query types that REQUIRE a tenant_id
TENANT_REQUIRED_QUERIES = {
    "top_practitioners",
}


@router.get("/query/{query_type}", response_model=QueryResponse)
async def execute_bi_query(
    query_type: QueryType,
    tenant_id: str | None = Query(None, description="Tenant ID (optional for most queries)"),
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
        tenant_id: Tenant ID (required for tenant-scoped queries, optional for others)
        user_id: User ID filter (optional)
        start_date: Start date for date range
        end_date: End date for date range
        limit: Maximum number of rows to return
        current_user: Current authenticated user
        
    Returns:
        QueryResponse with results
    """
    try:
        # Validate tenant_id requirement
        if query_type in TENANT_REQUIRED_QUERIES and not tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"tenant_id is required for {query_type} query"
            )
        
        # Build query based on type
        query = _build_query(query_type, tenant_id, user_id, start_date, end_date, limit)
        
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


def _build_query(
    query_type: str,
    tenant_id: str | None,
    user_id: str | None,
    start_date: str | None,
    end_date: str | None,
    limit: int,
) -> str:
    """Route query_type to the correct service method"""
    
    # Overview queries
    if query_type == "total_sessions":
        return bi_query_service.get_total_sessions(start_date, end_date)
    elif query_type == "sessions_by_status":
        return bi_query_service.get_sessions_by_status(start_date, end_date)
    elif query_type == "sessions_trend":
        return bi_query_service.get_sessions_trend(start_date, end_date)
    elif query_type == "top_tenants":
        return bi_query_service.get_top_tenants(start_date, end_date)
    elif query_type == "top_practitioners":
        return bi_query_service.get_top_practitioners(tenant_id, start_date, end_date)
    
    # Audit trail
    elif query_type == "audit_trail":
        return bi_query_service.get_audit_trail(tenant_id, start_date, end_date, user_id, limit)
    
    # Unsigned notes
    elif query_type == "unsigned_notes":
        return bi_query_service.get_unsigned_notes(tenant_id, start_date, end_date, limit)
    elif query_type == "unsigned_notes_count":
        return bi_query_service.get_unsigned_notes_count(tenant_id, start_date, end_date)
    elif query_type == "unsigned_notes_by_practitioner":
        return bi_query_service.get_unsigned_notes_by_practitioner(tenant_id, start_date, end_date, limit)
    
    # Service usage
    elif query_type == "service_usage_tenant":
        return bi_query_service.get_service_usage_by_tenant(tenant_id, start_date, end_date)
    elif query_type == "service_usage_practitioner":
        return bi_query_service.get_service_usage_by_practitioner(tenant_id, start_date, end_date, limit)
    elif query_type == "service_usage_patient":
        return bi_query_service.get_service_usage_by_patient(tenant_id, start_date, end_date, limit)
    
    # Weekly summary
    elif query_type == "weekly_summary":
        return bi_query_service.get_weekly_summary(tenant_id, start_date, end_date)
    elif query_type == "weekly_summary_by_tenant":
        return bi_query_service.get_weekly_summary_by_tenant(tenant_id, start_date, end_date)
    
    # Adoption analytics
    elif query_type == "daily_active_users":
        return bi_query_service.get_daily_active_users(tenant_id, start_date, end_date)
    elif query_type == "monthly_active_users":
        return bi_query_service.get_monthly_active_users(tenant_id, start_date, end_date)
    elif query_type == "growth_metrics":
        return bi_query_service.get_growth_metrics(tenant_id, start_date, end_date)
    
    # Analytics
    elif query_type == "note_format_usage":
        return bi_query_service.get_note_format_usage(tenant_id, start_date, end_date)
    elif query_type == "events_by_type":
        return bi_query_service.get_events_by_type(tenant_id, start_date, end_date)
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown query type: {query_type}"
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
                "description": "Count of sessions grouped by status",
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
                "description": "Top practitioners within a tenant",
                "requires_tenant": True,
            },
            {
                "type": "audit_trail",
                "name": "Audit Trail",
                "description": "Detailed event log for compliance and tracking",
                "requires_tenant": False,
            },
            {
                "type": "unsigned_notes",
                "name": "Unsigned Notes",
                "description": "Notes awaiting practitioner signature",
                "requires_tenant": False,
            },
            {
                "type": "unsigned_notes_count",
                "name": "Unsigned Notes Count",
                "description": "Count of unsigned notes",
                "requires_tenant": False,
            },
            {
                "type": "unsigned_notes_by_practitioner",
                "name": "Unsigned Notes by Practitioner",
                "description": "Unsigned notes grouped by practitioner",
                "requires_tenant": False,
            },
            {
                "type": "weekly_summary",
                "name": "Weekly Summary",
                "description": "Week-over-week usage trends",
                "requires_tenant": False,
            },
            {
                "type": "weekly_summary_by_tenant",
                "name": "Weekly Summary by Tenant",
                "description": "Weekly summary broken down by tenant",
                "requires_tenant": False,
            },
            {
                "type": "daily_active_users",
                "name": "Daily Active Users",
                "description": "Daily active user count (DAU)",
                "requires_tenant": False,
            },
            {
                "type": "monthly_active_users",
                "name": "Monthly Active Users",
                "description": "Monthly active user count (MAU)",
                "requires_tenant": False,
            },
            {
                "type": "growth_metrics",
                "name": "Growth Metrics",
                "description": "Monthly growth in sessions, users, patients, and tenants",
                "requires_tenant": False,
            },
            {
                "type": "service_usage_tenant",
                "name": "Service Usage by Tenant",
                "description": "Service usage analytics grouped by tenant",
                "requires_tenant": False,
            },
            {
                "type": "service_usage_practitioner",
                "name": "Service Usage by Practitioner",
                "description": "Service usage analytics grouped by practitioner",
                "requires_tenant": False,
            },
            {
                "type": "service_usage_patient",
                "name": "Service Usage by Patient",
                "description": "Service usage analytics grouped by patient",
                "requires_tenant": False,
            },
            {
                "type": "note_format_usage",
                "name": "Note Format Usage",
                "description": "Usage statistics by note format (GIRPP, SOAP, etc.)",
                "requires_tenant": False,
            },
            {
                "type": "events_by_type",
                "name": "Events by Type",
                "description": "Event counts grouped by event type",
                "requires_tenant": False,
            },
        ]
    }
