import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface DataTableProps {
  data: Record<string, any>[];
  columns?: string[];
}

/**
 * Data table component for displaying query results
 * Follows UI/UX design plan: sortable, paginated, professional styling
 */
export default function DataTable({ data, columns }: DataTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Extract columns from first row if not provided
  const tableColumns = columns || (data.length > 0 ? Object.keys(data[0]) : []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginate data
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No data to display</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)' }}>
      <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {tableColumns.map((column) => (
              <TableCell
                key={column}
                sx={{
                  backgroundColor: 'grey.100',
                  fontWeight: 600,
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: 'action.hover',
                },
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              {tableColumns.map((column) => (
                <TableCell key={column} sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {row[column] !== null && row[column] !== undefined
                    ? String(row[column])
                    : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Rows per page:"
      />
    </TableContainer>
  );
}
