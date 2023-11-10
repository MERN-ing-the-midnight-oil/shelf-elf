import React from 'react';
import { useTable } from 'react-table';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

const AvailableTable = ({ books, onRequestClick }) => {
  // Define columns
  const columns = React.useMemo(
    () => [
      { Header: 'Title', accessor: 'title' },
      { Header: 'Author', accessor: 'author' },
      { Header: 'Description', accessor: 'description' },
      { Header: 'Offered by', accessor: 'owner.username' },
      // Action column not included here; we will handle it separately
    ],
    []
  );

  // Use the useTable Hook to send the columns and data to build the table
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: books,
  });

  // Render the UI for your table
  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps()}>
                  {column.render('Header')}
                </TableCell>
              ))}
              <TableCell>Action</TableCell>
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <TableCell {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </TableCell>
                ))}
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onRequestClick(row.original)}
                  >
                    Request!
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AvailableTable;
