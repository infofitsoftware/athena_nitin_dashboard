import asyncio
import time
from typing import Any
import boto3
from botocore.exceptions import ClientError
from concurrent.futures import ThreadPoolExecutor
from app.core.config import settings


class AthenaService:
    """Service for executing Athena queries"""
    
    def __init__(self):
        """Initialize Athena client"""
        self.client = boto3.client(
            'athena',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region,
        )
        self.workgroup = settings.athena_workgroup or 'primary'
        self.database = settings.athena_database
        self.output_location = settings.athena_output_s3
        self.executor = ThreadPoolExecutor(max_workers=5)
    
    async def execute_query(
        self,
        query: str,
        database: str | None = None,
        workgroup: str | None = None,
        max_wait_time: int = 300,
    ) -> dict[str, Any]:
        """
        Execute an Athena query and return results
        
        Args:
            query: SQL query string
            database: Database name (defaults to config)
            workgroup: Workgroup name (defaults to config)
            max_wait_time: Maximum time to wait for query completion (seconds)
            
        Returns:
            Dictionary with query results and metadata
            
        Raises:
            Exception: If query execution fails
        """
        database = database or self.database
        workgroup = workgroup or self.workgroup
        
        if not database:
            raise ValueError("Database name is required")
        
        try:
            # Start query execution (run in thread pool)
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                self.executor,
                lambda: self.client.start_query_execution(
                    QueryString=query,
                    QueryExecutionContext={'Database': database},
                    WorkGroup=workgroup,
                    ResultConfiguration={
                        'OutputLocation': self.output_location
                    } if self.output_location else None,
                )
            )
            
            query_execution_id = response['QueryExecutionId']
            
            # Poll for query completion
            query_status = await self._wait_for_query_completion(
                query_execution_id,
                max_wait_time
            )
            
            if query_status['Status']['State'] == 'FAILED':
                reason = query_status['Status'].get('StateChangeReason', 'Unknown error')
                raise Exception(f"Query failed: {reason}")
            
            if query_status['Status']['State'] == 'CANCELLED':
                raise Exception("Query was cancelled")
            
            # Get query results (run in thread pool)
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                self.executor,
                self._get_query_results,
                query_execution_id
            )
            
            return {
                'query_execution_id': query_execution_id,
                'status': query_status['Status']['State'],
                'data_scanned_bytes': query_status.get('Statistics', {}).get('DataScannedInBytes', 0),
                'execution_time_ms': query_status.get('Statistics', {}).get('EngineExecutionTimeInMillis', 0),
                'results': results,
            }
            
        except ClientError as e:
            raise Exception(f"AWS error: {str(e)}")
        except Exception as e:
            raise Exception(f"Query execution error: {str(e)}")
    
    async def _wait_for_query_completion(
        self,
        query_execution_id: str,
        max_wait_time: int,
    ) -> dict[str, Any]:
        """
        Poll for query completion
        
        Args:
            query_execution_id: Query execution ID
            max_wait_time: Maximum time to wait (seconds)
            
        Returns:
            Query execution status
        """
        start_time = time.time()
        poll_interval = 1  # seconds
        
        loop = asyncio.get_event_loop()
        
        while True:
            response = await loop.run_in_executor(
                self.executor,
                lambda: self.client.get_query_execution(
                    QueryExecutionId=query_execution_id
                )
            )
            
            status = response['QueryExecution']['Status']['State']
            
            if status in ['SUCCEEDED', 'FAILED', 'CANCELLED']:
                return response['QueryExecution']
            
            elapsed_time = time.time() - start_time
            if elapsed_time >= max_wait_time:
                raise Exception(f"Query timeout after {max_wait_time} seconds")
            
            await asyncio.sleep(poll_interval)
    
    def _get_query_results(self, query_execution_id: str) -> list[dict[str, Any]]:
        """
        Retrieve query results from S3
        
        Args:
            query_execution_id: Query execution ID
            
        Returns:
            List of result rows as dictionaries
        """
        paginator = self.client.get_paginator('get_query_results')
        results = []
        headers = None
        
        for page in paginator.paginate(QueryExecutionId=query_execution_id):
            result_set = page['ResultSet']
            
            # Get column names from first page
            if headers is None:
                headers = [col['Name'] for col in result_set['ResultSetMetadata']['ColumnInfo']]
            
            # Process data rows (skip header row)
            for row in result_set['Rows'][1:]:
                row_data = {}
                for i, data in enumerate(row['Data']):
                    # Handle different data types
                    value = data.get('VarCharValue', '')
                    # Try to convert to appropriate type
                    if value == '':
                        row_data[headers[i]] = None
                    else:
                        row_data[headers[i]] = value
                results.append(row_data)
        
        return results
