import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface ServiceUsageData {
  tenant_id?: string;
  user_id?: string;
  patient_id?: string;
  total_sessions?: number;
  unique_patients?: number;
  total_audio_duration_seconds?: number;
  [key: string]: any;
}

interface ServiceUsageChartProps {
  data: ServiceUsageData[];
  title?: string;
  subtitle?: string;
  groupBy: 'tenant' | 'practitioner' | 'patient';
  limit?: number;
}

/**
 * Bar chart showing service usage by tenant, practitioner, or patient
 * Displays total sessions and optionally other metrics
 */
export default function ServiceUsageChart({
  data,
  title,
  subtitle,
  groupBy,
  limit = 10,
}: ServiceUsageChartProps) {
  if (!data || data.length === 0) {
    return <ChartWrapper title={title || 'Service Usage'} subtitle={subtitle} empty emptyMessage="No usage data available" />;
  }

  // Determine title and key based on groupBy
  const getTitle = () => {
    if (title) return title;
    switch (groupBy) {
      case 'tenant':
        return 'Service Usage by Tenant';
      case 'practitioner':
        return 'Service Usage by Practitioner';
      case 'patient':
        return 'Service Usage by Patient';
      default:
        return 'Service Usage';
    }
  };

  const getKey = () => {
    switch (groupBy) {
      case 'tenant':
        return 'tenant_id';
      case 'practitioner':
        return 'user_id';
      case 'patient':
        return 'patient_id';
      default:
        return 'tenant_id';
    }
  };

  // Sort by total_sessions and take top N
  const sortedData = [...data]
    .sort((a, b) => (b.total_sessions || 0) - (a.total_sessions || 0))
    .slice(0, limit)
    .map((item) => ({
      name: (item[getKey()] || 'Unknown').toString().substring(0, 20),
      sessions: item.total_sessions || 0,
      patients: item.unique_patients || 0,
      audioHours: Math.round((item.total_audio_duration_seconds || 0) / 3600),
    }));

  const chartTitle = getTitle();
  const chartSubtitle = subtitle || `Top ${limit} by total sessions`;

  return (
    <ChartWrapper title={chartTitle} subtitle={chartSubtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 10 }}
          />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'audioHours') return [`${value}h`, 'Audio Hours'];
              if (name === 'sessions') return [value.toLocaleString(), 'Sessions'];
              return [value.toLocaleString(), name];
            }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="sessions" fill="#3498db" name="Total Sessions" />
          <Bar dataKey="patients" fill="#2ecc71" name="Unique Patients" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
