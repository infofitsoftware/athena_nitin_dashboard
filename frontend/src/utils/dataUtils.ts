/**
 * Data transformation utilities
 */

/**
 * Calculate percentage change between two values
 */
export function calculateChange(current: number, previous: number): {
  change: number;
  trend: 'up' | 'down' | 'neutral';
} {
  if (!previous || previous === 0) {
    return { change: 0, trend: 'neutral' };
  }

  const change = ((current - previous) / previous) * 100;

  if (Math.abs(change) < 0.01) {
    return { change: 0, trend: 'neutral' };
  }

  return {
    change: Math.round(change * 10) / 10, // Round to 1 decimal
    trend: change > 0 ? 'up' : 'down',
  };
}

/**
 * Format number with locale
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0';
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toLocaleString();
  }
  return value.toLocaleString();
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

/**
 * Truncate long IDs for display
 */
export function truncateId(id: string | null | undefined, maxLength = 20): string {
  if (!id) return 'Unknown';
  if (id.length <= maxLength) return id;
  return id.substring(0, maxLength - 3) + '...';
}

/**
 * Group data by key and count
 */
export function groupByCount<T>(
  data: T[],
  keyFn: (item: T) => string
): Array<{ name: string; count: number }> {
  const counts: Record<string, number> = {};

  data.forEach((item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Bucket numeric values into ranges
 */
export function bucketValues(
  values: number[],
  buckets: Array<{ label: string; min: number; max: number }>
): Array<{ label: string; count: number }> {
  const counts = buckets.map(() => 0);

  values.forEach((value) => {
    buckets.forEach((bucket, index) => {
      if (value >= bucket.min && value <= bucket.max) {
        counts[index]++;
      }
    });
  });

  return buckets.map((bucket, index) => ({
    label: bucket.label,
    count: counts[index],
  }));
}
