//this component uses react-table version 7

import React from 'react';
import { useTable, useSortBy } from 'react-table';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  owner: {
    _id: string;
    username: string;
  };
}

interface AvailableTableProps {
  books: Book[];
  onRequestClick: (book: Book) => void;
}


const AvailableTable: React.FC<AvailableTableProps> = ({ books, onRequestClick }) => {
  // Define columns for react-table 
  const columns = React.useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title' as const,
      },
      {
        Header: 'Author',
        accessor: 'author' as const,
      },
      {
        Header: 'Description',
        accessor: 'description' as const,
        Cell: ({ value }: { value: string }) => (value ? value.substr(0, 100) + '...' : ''),
      },
      {
        Header: 'Offered by',
        accessor: (row: Book) => row.owner.username,
        id: 'owner',
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }: { row: { original: Book } }) => (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onRequestClick(row.original)}
          >
            Request
          </Button>
        ),
      },
    ],
    [onRequestClick]
  );


  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    { columns, data: books },
    useSortBy // Adding sorting functionality
  );

  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...(column as any).getHeaderProps((column as any).getSortByToggleProps())}>
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  <span>
                    {(column as any).isSorted
                      ? (column as any).isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </TableCell>
              ))}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AvailableTable;