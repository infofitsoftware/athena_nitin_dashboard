/**
 * Utility functions for exporting data to CSV
 */

export interface ExportOptions {
  filename?: string;
  headers?: string[];
  includeHeaders?: boolean;
}

/**
 * Export data array to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const {
    filename = `export_${new Date().toISOString().split('T')[0]}.csv`,
    headers,
    includeHeaders = true,
  } = options;

  // Determine headers
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV content
  const rows: string[] = [];

  // Add header row
  if (includeHeaders) {
    rows.push(csvHeaders.map((h) => escapeCSVValue(h)).join(','));
  }

  // Add data rows
  data.forEach((row) => {
    const values = csvHeaders.map((header) => {
      const value = row[header];
      return escapeCSVValue(value !== null && value !== undefined ? String(value) : '');
    });
    rows.push(values.join(','));
  });

  const csvContent = rows.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV value (handles commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Export chart data to CSV
 * Useful for exporting aggregated chart data
 */
export function exportChartDataToCSV(
  data: Array<Record<string, any>>,
  filename?: string
): void {
  if (!data || data.length === 0) {
    console.warn('No chart data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  exportToCSV(data, {
    filename: filename || `chart_data_${new Date().toISOString().split('T')[0]}.csv`,
    headers,
  });
}
