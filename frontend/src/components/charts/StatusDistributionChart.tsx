import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface StatusDistributionChartProps {
  data: Array<{ status: string; count: number }>;
  title?: string;
  subtitle?: string;
}

const COLORS = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6'];

/**
 * Pie chart showing distribution of statuses
 * Used for sessions by status, action types, etc.
 */
export default function StatusDistributionChart({
  data,
  title = 'Status Distribution',
  subtitle,
}: StatusDistributionChartProps) {
  if (!data || data.length === 0) {
    return <ChartWrapper title={title} subtitle={subtitle} empty emptyMessage="No status data available" />;
  }

  const chartData = data.map((item) => ({
    name: item.status || 'Unknown',
    value: item.count || 0,
  }));

  return (
    <ChartWrapper title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), 'Count']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
