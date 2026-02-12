import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ChartWrapper from './ChartWrapper';

interface WeeklyTrendData {
  week?: string;
  week_start?: string;
  weekStart?: string;
  users?: number;
  total_sessions?: number;
  totalSessions?: number;
  total_audio_minutes?: number;
  totalAudioMinutes?: number;
  [key: string]: any;
}

interface WeeklyTrendsChartProps {
  data: WeeklyTrendData[];
  title?: string;
  subtitle?: string;
}

const METRIC_OPTIONS = [
  { key: 'users', label: 'Users', color: '#38bdf8' },
  { key: 'sessions', label: 'Sessions', color: '#10b981' },
  { key: 'audioMinutes', label: 'Audio Minutes', color: '#f59e0b' },
];

/**
 * Line chart showing weekly trends
 * Toggleable between different metrics (users, sessions, audio minutes)
 */
export default function WeeklyTrendsChart({
  data,
  title = 'Weekly Trends',
  subtitle,
}: WeeklyTrendsChartProps) {
  const [activeMetric, setActiveMetric] = useState<string>('users');

  if (!data || data.length === 0) {
    return <ChartWrapper title={title} subtitle={subtitle} empty emptyMessage="No trend data available" />;
  }

  // Transform data for chart
  const chartData = data.map((item) => {
    const weekLabel =
      item.week ||
      item.week_start ||
      item.weekStart ||
      'Unknown';
    
    // Format week label (remove time if present)
    const formattedWeek = weekLabel.includes('T')
      ? weekLabel.split('T')[0]
      : weekLabel.split(' ')[0];

    return {
      week: formattedWeek,
      users: item.users || 0,
      sessions: item.total_sessions || item.totalSessions || 0,
      audioMinutes: Math.round((item.total_audio_minutes || item.totalAudioMinutes || 0) / 60),
    };
  });

  // Sort by week
  chartData.sort((a, b) => a.week.localeCompare(b.week));

  const activeConfig = METRIC_OPTIONS.find((opt) => opt.key === activeMetric) || METRIC_OPTIONS[0];

  const handleMetricChange = (_event: React.MouseEvent<HTMLElement>, newMetric: string | null) => {
    if (newMetric !== null) {
      setActiveMetric(newMetric);
    }
  };

  return (
    <ChartWrapper title={title} subtitle={subtitle}>
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={activeMetric}
          exclusive
          onChange={handleMetricChange}
          size="small"
          aria-label="metric selection"
        >
          {METRIC_OPTIONS.map((option) => (
            <ToggleButton key={option.key} value={option.key}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [
              `${value.toLocaleString()}${activeMetric === 'audioMinutes' ? ' min' : ''}`,
              activeConfig.label,
            ]}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={activeMetric}
            stroke={activeConfig.color}
            strokeWidth={2}
            dot={{ fill: activeConfig.color, r: 4 }}
            name={activeConfig.label}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
