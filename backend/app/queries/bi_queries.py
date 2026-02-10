"""
BI Queries for Clinical Audit Dashboard

This file contains all the SQL queries used for business intelligence and analytics.
Each query is designed to answer specific business questions about clinical documentation usage.

Queries using {tenant_filter} support optional tenant filtering:
- When tenant_id is provided: filters to that specific tenant
- When tenant_id is omitted: shows data across all tenants
"""

# ============================================================================
# OVERVIEW / DASHBOARD QUERIES
# ============================================================================

QUERY_TOTAL_SESSIONS = """
SELECT 
    COUNT(DISTINCT care_record_id) as total_sessions,
    COUNT(DISTINCT tenant_id) as total_tenants,
    COUNT(DISTINCT user_id) as total_users
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
"""

QUERY_SESSIONS_BY_STATUS = """
SELECT 
    status,
    COUNT(DISTINCT care_record_id) as session_count
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
GROUP BY status
ORDER BY session_count DESC
"""

QUERY_SESSIONS_TREND = """
SELECT 
    DATE(creation_datetime) as date,
    COUNT(DISTINCT care_record_id) as session_count
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
GROUP BY DATE(creation_datetime)
ORDER BY date ASC
"""

QUERY_TOP_TENANTS = """
SELECT 
    tenant_id,
    COUNT(DISTINCT care_record_id) as session_count,
    COUNT(DISTINCT user_id) as user_count
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
GROUP BY tenant_id
ORDER BY session_count DESC
LIMIT 10
"""

QUERY_TOP_PRACTITIONERS = """
SELECT 
    tenant_id,
    user_id,
    COUNT(DISTINCT care_record_id) as session_count,
    SUM(CAST(audio_duration AS double)) as total_audio_duration_seconds
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    AND tenant_id = '{tenant_id}'
GROUP BY tenant_id, user_id
ORDER BY session_count DESC
LIMIT 20
"""

# ============================================================================
# AUDIT TRAIL QUERIES
# ============================================================================

QUERY_AUDIT_TRAIL = """
SELECT 
    event_name,
    tenant_id,
    user_id,
    patient_name,
    patient_id,
    status,
    care_record_id,
    session_id,
    creation_datetime,
    completed_datetime,
    submitted_datetime,
    audio_duration,
    note_format
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
    {user_filter}
ORDER BY creation_datetime DESC
LIMIT {limit}
"""

QUERY_AUDIT_TRAIL_BY_USER = """
SELECT 
    event_name,
    tenant_id,
    user_id,
    patient_name,
    patient_id,
    status,
    care_record_id,
    session_id,
    creation_datetime,
    completed_datetime,
    submitted_datetime,
    audio_duration,
    note_format
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    AND tenant_id = '{tenant_id}'
    AND user_id = '{user_id}'
ORDER BY creation_datetime DESC
LIMIT {limit}
"""

# ============================================================================
# SERVICE USAGE QUERIES
# ============================================================================

QUERY_SERVICE_USAGE_BY_TENANT = """
SELECT 
    tenant_id,
    COUNT(DISTINCT care_record_id) as total_sessions,
    COUNT(DISTINCT patient_id) as unique_patients,
    COUNT(DISTINCT user_id) as active_practitioners,
    SUM(CAST(audio_duration AS double)) as total_audio_duration_seconds,
    AVG(CAST(audio_duration AS double)) as avg_audio_duration_seconds
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
GROUP BY tenant_id
ORDER BY total_sessions DESC
"""

QUERY_SERVICE_USAGE_BY_PRACTITIONER = """
SELECT 
    tenant_id,
    user_id,
    COUNT(DISTINCT care_record_id) as session_count,
    COUNT(DISTINCT patient_id) as patient_count,
    SUM(CAST(audio_duration AS double)) as total_audio_duration_seconds,
    AVG(CAST(audio_duration AS double)) as avg_audio_duration_seconds,
    MIN(creation_datetime) as first_session,
    MAX(creation_datetime) as last_session
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
GROUP BY tenant_id, user_id
ORDER BY session_count DESC
LIMIT {limit}
"""

QUERY_SERVICE_USAGE_BY_PATIENT = """
SELECT 
    patient_id,
    patient_name,
    tenant_id,
    COUNT(DISTINCT care_record_id) as visit_count,
    COUNT(DISTINCT user_id) as practitioner_count,
    SUM(CAST(audio_duration AS double)) as total_audio_duration_seconds,
    MAX(creation_datetime) as last_visit
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
GROUP BY patient_id, patient_name, tenant_id
ORDER BY visit_count DESC
LIMIT {limit}
"""

# ============================================================================
# UNSIGNED NOTES QUERIES
# ============================================================================

QUERY_UNSIGNED_NOTES = """
SELECT 
    care_record_id,
    tenant_id,
    user_id,
    patient_name,
    patient_id,
    creation_datetime,
    completed_datetime,
    lastupdated_datetime,
    note_format,
    audio_duration,
    status,
    status_reason
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
    AND status IN ('COMPLETED', 'UNSIGNED')
    AND submitted_datetime IS NULL
ORDER BY completed_datetime DESC
LIMIT {limit}
"""

QUERY_UNSIGNED_NOTES_COUNT = """
SELECT 
    COUNT(DISTINCT care_record_id) as unsigned_count
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
    AND status IN ('COMPLETED', 'UNSIGNED')
    AND submitted_datetime IS NULL
"""

QUERY_UNSIGNED_NOTES_BY_PRACTITIONER = """
SELECT 
    tenant_id,
    user_id,
    COUNT(DISTINCT care_record_id) as unsigned_count
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
    AND status IN ('COMPLETED', 'UNSIGNED')
    AND submitted_datetime IS NULL
GROUP BY tenant_id, user_id
ORDER BY unsigned_count DESC
LIMIT {limit}
"""

# ============================================================================
# WEEKLY SUMMARY QUERIES
# ============================================================================

QUERY_WEEKLY_SUMMARY = """
SELECT 
    DATE_TRUNC('week', DATE(creation_datetime)) as week_start,
    COUNT(DISTINCT care_record_id) as session_count,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT patient_id) as unique_patients,
    COUNT(DISTINCT tenant_id) as active_tenants,
    SUM(CAST(audio_duration AS double)) as total_audio_duration_seconds,
    AVG(CAST(audio_duration AS double)) as avg_audio_duration_seconds
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
GROUP BY DATE_TRUNC('week', DATE(creation_datetime))
ORDER BY week_start DESC
"""

QUERY_WEEKLY_SUMMARY_BY_TENANT = """
SELECT 
    DATE_TRUNC('week', DATE(creation_datetime)) as week_start,
    tenant_id,
    COUNT(DISTINCT care_record_id) as session_count,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT patient_id) as unique_patients,
    SUM(CAST(audio_duration AS double)) as total_audio_duration_seconds
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
GROUP BY DATE_TRUNC('week', DATE(creation_datetime)), tenant_id
ORDER BY week_start DESC, session_count DESC
"""

QUERY_WEEK_OVER_WEEK_COMPARISON = """
WITH current_week AS (
    SELECT 
        COUNT(DISTINCT care_record_id) as sessions,
        COUNT(DISTINCT user_id) as users,
        COUNT(DISTINCT patient_id) as patients
    FROM {table_name}
    WHERE creation_datetime >= TIMESTAMP '{current_week_start} 00:00:00'
        AND creation_datetime <= TIMESTAMP '{current_week_end} 23:59:59'
        AND tenant_id = '{tenant_id}'
),
previous_week AS (
    SELECT 
        COUNT(DISTINCT care_record_id) as sessions,
        COUNT(DISTINCT user_id) as users,
        COUNT(DISTINCT patient_id) as patients
    FROM {table_name}
    WHERE creation_datetime >= TIMESTAMP '{previous_week_start} 00:00:00'
        AND creation_datetime <= TIMESTAMP '{previous_week_end} 23:59:59'
        AND tenant_id = '{tenant_id}'
)
SELECT 
    cw.sessions as current_sessions,
    pw.sessions as previous_sessions,
    cw.users as current_users,
    pw.users as previous_users,
    cw.patients as current_patients,
    pw.patients as previous_patients,
    ROUND(((cw.sessions - pw.sessions) * 100.0 / NULLIF(pw.sessions, 0)), 2) as sessions_change_pct,
    ROUND(((cw.users - pw.users) * 100.0 / NULLIF(pw.users, 0)), 2) as users_change_pct
FROM current_week cw
CROSS JOIN previous_week pw
"""

# ============================================================================
# ADOPTION ANALYTICS QUERIES
# ============================================================================

QUERY_DAILY_ACTIVE_USERS = """
SELECT 
    DATE(creation_datetime) as date,
    COUNT(DISTINCT user_id) as dau,
    COUNT(DISTINCT care_record_id) as sessions,
    COUNT(DISTINCT tenant_id) as tenants
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
GROUP BY DATE(creation_datetime)
ORDER BY date ASC
"""

QUERY_MONTHLY_ACTIVE_USERS = """
SELECT 
    DATE_TRUNC('month', DATE(creation_datetime)) as month,
    COUNT(DISTINCT user_id) as mau,
    COUNT(DISTINCT care_record_id) as sessions,
    COUNT(DISTINCT tenant_id) as tenants
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
GROUP BY DATE_TRUNC('month', DATE(creation_datetime))
ORDER BY month ASC
"""

QUERY_USER_RETENTION_COHORT = """
SELECT 
    DATE_TRUNC('month', first_activity) as cohort_month,
    COUNT(DISTINCT user_id) as cohort_size,
    COUNT(DISTINCT CASE WHEN months_since_first <= 0 THEN user_id END) as month_0,
    COUNT(DISTINCT CASE WHEN months_since_first <= 1 THEN user_id END) as month_1,
    COUNT(DISTINCT CASE WHEN months_since_first <= 2 THEN user_id END) as month_2,
    COUNT(DISTINCT CASE WHEN months_since_first <= 3 THEN user_id END) as month_3
FROM (
    SELECT 
        user_id,
        MIN(DATE_TRUNC('month', DATE(creation_datetime))) as first_activity,
        DATE_DIFF('month', 
            MIN(DATE_TRUNC('month', DATE(creation_datetime))) OVER (PARTITION BY user_id),
            DATE_TRUNC('month', DATE(creation_datetime))
        ) as months_since_first
    FROM {table_name}
    WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
        AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
        {tenant_filter}
    GROUP BY user_id, DATE(creation_datetime)
)
GROUP BY DATE_TRUNC('month', first_activity)
ORDER BY cohort_month DESC
"""

QUERY_GROWTH_METRICS = """
SELECT 
    DATE_TRUNC('month', DATE(creation_datetime)) as month,
    COUNT(DISTINCT care_record_id) as sessions,
    COUNT(DISTINCT user_id) as users,
    COUNT(DISTINCT patient_id) as patients,
    COUNT(DISTINCT tenant_id) as tenants,
    SUM(CAST(audio_duration AS double)) as total_audio_seconds
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
GROUP BY DATE_TRUNC('month', DATE(creation_datetime))
ORDER BY month ASC
"""

# ============================================================================
# EVENT-SPECIFIC QUERIES
# ============================================================================

QUERY_EVENTS_BY_TYPE = """
SELECT 
    event_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT care_record_id) as unique_sessions
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
GROUP BY event_name
ORDER BY event_count DESC
"""

QUERY_SESSION_LIFECYCLE = """
SELECT 
    care_record_id,
    patient_name,
    user_id,
    MIN(CASE WHEN event_name = 'Session Started' THEN creation_datetime END) as session_started,
    MIN(CASE WHEN event_name = 'Session Transcribed' THEN creation_datetime END) as transcribed,
    MIN(CASE WHEN event_name = 'Note Completed' THEN creation_datetime END) as note_completed,
    MIN(CASE WHEN event_name = 'Note Signed' THEN creation_datetime END) as note_signed,
    status,
    audio_duration
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    AND tenant_id = '{tenant_id}'
    AND care_record_id = '{care_record_id}'
GROUP BY care_record_id, patient_name, user_id, status, audio_duration
"""

# ============================================================================
# NOTE FORMAT ANALYTICS
# ============================================================================

QUERY_NOTE_FORMAT_USAGE = """
SELECT 
    note_format,
    COUNT(DISTINCT care_record_id) as usage_count,
    COUNT(DISTINCT user_id) as users_using_format,
    AVG(CAST(audio_duration AS double)) as avg_audio_duration
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
    AND note_format IS NOT NULL
GROUP BY note_format
ORDER BY usage_count DESC
"""

# ============================================================================
# AUDIO DURATION ANALYTICS
# ============================================================================

QUERY_AUDIO_DURATION_STATS = """
SELECT 
    tenant_id,
    AVG(CAST(audio_duration AS double)) as avg_duration_seconds,
    MIN(CAST(audio_duration AS double)) as min_duration_seconds,
    MAX(CAST(audio_duration AS double)) as max_duration_seconds,
    APPROX_PERCENTILE(CAST(audio_duration AS double), 0.5) as median_duration_seconds
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
    AND audio_duration IS NOT NULL
GROUP BY tenant_id
"""

QUERY_AUDIO_DURATION_DISTRIBUTION = """
SELECT 
    CASE 
        WHEN CAST(audio_duration AS double) < 300 THEN '0-5 min'
        WHEN CAST(audio_duration AS double) < 600 THEN '5-10 min'
        WHEN CAST(audio_duration AS double) < 900 THEN '10-15 min'
        WHEN CAST(audio_duration AS double) < 1800 THEN '15-30 min'
        WHEN CAST(audio_duration AS double) < 3600 THEN '30-60 min'
        ELSE '60+ min'
    END as duration_bucket,
    COUNT(DISTINCT care_record_id) as session_count
FROM {table_name}
WHERE creation_datetime >= TIMESTAMP '{start_date} 00:00:00'
    AND creation_datetime <= TIMESTAMP '{end_date} 23:59:59'
    {tenant_filter}
    AND audio_duration IS NOT NULL
GROUP BY 1
ORDER BY MIN(CAST(audio_duration AS double))
"""
