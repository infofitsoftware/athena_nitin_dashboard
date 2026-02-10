"""
BI Query Service

Service for building and executing BI queries from the queries library.
Handles query parameter substitution and validation.
"""

from datetime import datetime, timedelta
from typing import Any
from app.queries import bi_queries
from app.core.config import settings
from app.services.query_service import QueryService


class BIQueryService:
    """Service for building and executing BI queries"""
    
    def __init__(self):
        self.table_name = settings.athena_table or "audittt"
    
    def build_query(
        self,
        query_template: str,
        start_date: str | None = None,
        end_date: str | None = None,
        tenant_id: str | None = None,
        user_id: str | None = None,
        limit: int = 1000,
        **kwargs: Any
    ) -> str:
        """
        Build a BI query by substituting parameters
        
        Args:
            query_template: Query template from bi_queries
            start_date: Start date (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)
            end_date: End date (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)
            tenant_id: Tenant ID filter
            user_id: User ID filter
            limit: Result limit
            **kwargs: Additional parameters for query
            
        Returns:
            Formatted SQL query string
        """
        # Default date range: last 30 days
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        # Format dates for Athena TIMESTAMP (YYYY-MM-DD format)
        formatted_start_date = self._format_date(start_date)
        formatted_end_date = self._format_date(end_date)
        
        # Build tenant filter if provided
        tenant_filter = ""
        if tenant_id:
            tenant_filter = f"AND tenant_id = '{tenant_id}'"
        
        # Build user filter if provided
        user_filter = ""
        if user_id:
            user_filter = f"AND user_id = '{user_id}'"
        
        # Substitute parameters
        query = query_template.format(
            table_name=self.table_name,
            start_date=formatted_start_date,
            end_date=formatted_end_date,
            tenant_id=tenant_id or '',
            user_id=user_id or '',
            tenant_filter=tenant_filter,
            user_filter=user_filter,
            limit=limit,
            **kwargs
        )
        
        return query
    
    def _format_date(self, date_str: str) -> str:
        """
        Format date string for Athena TIMESTAMP comparison
        
        Args:
            date_str: Date string (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)
            
        Returns:
            Formatted date string (YYYY-MM-DD)
        """
        try:
            # Extract just the date part (YYYY-MM-DD)
            if ' ' in date_str:
                return date_str.split()[0]
            elif 'T' in date_str:
                return date_str.split('T')[0]
            else:
                # Validate it's in YYYY-MM-DD format
                datetime.strptime(date_str, '%Y-%m-%d')
                return date_str
        except ValueError:
            # If parsing fails, return as-is
            return date_str
    
    def get_total_sessions(
        self,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for total sessions, tenants, and users"""
        return self.build_query(
            bi_queries.QUERY_TOTAL_SESSIONS,
            start_date=start_date,
            end_date=end_date
        )
    
    def get_sessions_by_status(
        self,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for sessions grouped by status"""
        return self.build_query(
            bi_queries.QUERY_SESSIONS_BY_STATUS,
            start_date=start_date,
            end_date=end_date
        )
    
    def get_sessions_trend(
        self,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for daily session trend"""
        return self.build_query(
            bi_queries.QUERY_SESSIONS_TREND,
            start_date=start_date,
            end_date=end_date
        )
    
    def get_top_tenants(
        self,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for top tenants by session count"""
        return self.build_query(
            bi_queries.QUERY_TOP_TENANTS,
            start_date=start_date,
            end_date=end_date
        )
    
    def get_top_practitioners(
        self,
        tenant_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for top practitioners within a tenant"""
        return self.build_query(
            bi_queries.QUERY_TOP_PRACTITIONERS,
            start_date=start_date,
            end_date=end_date,
            tenant_id=tenant_id
        )
    
    def get_audit_trail(
        self,
        tenant_id: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
        user_id: str | None = None,
        limit: int = 1000
    ) -> str:
        """Get query for audit trail"""
        return self.build_query(
            bi_queries.QUERY_AUDIT_TRAIL,
            start_date=start_date,
            end_date=end_date,
            tenant_id=tenant_id,
            user_id=user_id,
            limit=limit
        )
    
    def get_unsigned_notes(
        self,
        tenant_id: str,
        start_date: str | None = None,
        end_date: str | None = None,
        limit: int = 1000
    ) -> str:
        """Get query for unsigned notes"""
        return self.build_query(
            bi_queries.QUERY_UNSIGNED_NOTES,
            start_date=start_date,
            end_date=end_date,
            tenant_id=tenant_id,
            limit=limit
        )
    
    def get_unsigned_notes_count(
        self,
        tenant_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for count of unsigned notes"""
        return self.build_query(
            bi_queries.QUERY_UNSIGNED_NOTES_COUNT,
            start_date=start_date,
            end_date=end_date,
            tenant_id=tenant_id
        )
    
    def get_weekly_summary(
        self,
        tenant_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for weekly summary"""
        return self.build_query(
            bi_queries.QUERY_WEEKLY_SUMMARY,
            start_date=start_date,
            end_date=end_date,
            tenant_id=tenant_id
        )
    
    def get_daily_active_users(
        self,
        tenant_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for daily active users"""
        return self.build_query(
            bi_queries.QUERY_DAILY_ACTIVE_USERS,
            start_date=start_date,
            end_date=end_date,
            tenant_id=tenant_id
        )
    
    def get_service_usage_by_tenant(
        self,
        tenant_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for service usage by tenant"""
        return self.build_query(
            bi_queries.QUERY_SERVICE_USAGE_BY_TENANT,
            start_date=start_date,
            end_date=end_date,
            tenant_id=tenant_id
        )
    
    def get_note_format_usage(
        self,
        tenant_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> str:
        """Get query for note format usage analytics"""
        return self.build_query(
            bi_queries.QUERY_NOTE_FORMAT_USAGE,
            start_date=start_date,
            end_date=end_date,
            tenant_id=tenant_id
        )
