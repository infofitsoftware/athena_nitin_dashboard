import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Box, Chip } from '@mui/material';
import ChartWrapper from './ChartWrapper';

interface TopTenant {
  tenant_id: string;
  total_sessions?: number;
  total_tenants?: number;
  total_time?: string;
}

interface TopTenantsChartProps {
  data: TopTenant[];
  title?: string;
  subtitle?: string;
  limit?: number;
}

const COLORS = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'];

/**
 * Horizontal bar chart showing top tenants
 * Displays ranked list with optional badges for top 3
 */
export default function TopTenantsChart({
  data,
  title = 'Top Tenants',
  subtitle = 'Ranked by total sessions',
  limit = 10,
}: TopTenantsChartProps) {
  if (!data || data.length === 0) {
    return <ChartWrapper title={title} subtitle={subtitle} empty emptyMessage="No tenant data available" />;
  }

  // Sort by total_sessions and take top N
  const sortedData = [...data]
    .sort((a, b) => (b.total_sessions || 0) - (a.total_sessions || 0))
    .slice(0, limit)
    .map((item, index) => ({
      name: item.tenant_id || 'Unknown',
      sessions: item.total_sessions || 0,
      rank: index + 1,
    }));

  return (
    <ChartWrapper title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={{ left: 80, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => {
              // Truncate long tenant IDs
              if (value.length > 20) {
                return value.substring(0, 17) + '...';
              }
              return value;
            }}
          />
          <Tooltip
            cursor={false}
            formatter={(value: number) => [value.toLocaleString(), 'Sessions']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="sessions" name="Sessions" radius={[0, 6, 6, 0]}>
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index < 3 ? COLORS[index] : COLORS[3]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Rank badges for top 3 */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {sortedData.slice(0, 3).map((item, index) => {
          const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
          const rankLabels = ['🥇', '🥈', '🥉'];
          return (
            <Chip
              key={item.name}
              label={`#${item.rank} ${item.name.substring(0, 15)}${item.name.length > 15 ? '...' : ''}`}
              size="small"
              sx={{
                bgcolor: rankColors[index],
                color: index === 2 ? '#fff' : '#1a1a2e',
                fontWeight: 600,
              }}
            />
          );
        })}
      </Box>
    </ChartWrapper>
  );
}
