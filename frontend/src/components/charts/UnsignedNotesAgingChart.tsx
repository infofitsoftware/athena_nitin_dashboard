import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface UnsignedNote {
  days_pending?: number;
  daysPending?: number;
  [key: string]: any;
}

interface UnsignedNotesAgingChartProps {
  data: UnsignedNote[];
  title?: string;
  subtitle?: string;
}

const BUCKETS = [
  { label: '0-1 days', min: 0, max: 1, color: '#2ecc71' },
  { label: '2-3 days', min: 2, max: 3, color: '#f39c12' },
  { label: '4-7 days', min: 4, max: 7, color: '#e67e22' },
  { label: '8+ days', min: 8, max: Infinity, color: '#e74c3c' },
];

/**
 * Bar chart showing unsigned notes aging distribution
 * Groups notes into risk buckets based on days pending
 */
export default function UnsignedNotesAgingChart({
  data,
  title = 'Unsigned Notes Aging Distribution',
  subtitle,
}: UnsignedNotesAgingChartProps) {
  if (!data || data.length === 0) {
    return <ChartWrapper title={title} subtitle={subtitle} empty emptyMessage="No unsigned notes data available" />;
  }

  // Count notes in each bucket
  const bucketCounts = BUCKETS.map((bucket) => {
    const count = data.filter((note) => {
      const days = note.days_pending ?? note.daysPending ?? 0;
      return days >= bucket.min && days <= bucket.max;
    }).length;
    return {
      bucket: bucket.label,
      count,
      color: bucket.color,
    };
  });

  const totalNotes = data.length;
  const subtitleText = subtitle || `${totalNotes} total unsigned notes`;

  return (
    <ChartWrapper title={title} subtitle={subtitleText}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bucketCounts} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), 'Notes']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="count" name="Unsigned Notes" radius={[6, 6, 0, 0]}>
            {bucketCounts.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
