import React from 'react';
import { useTable, Column, CellProps, Row } from 'react-table';
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

interface TableProps {
  columns: Column<Book>[];
  data: Book[];
  // ... any other props
}

const AvailableTable: React.FC<AvailableTableProps> = ({ books, onRequestClick }) => {
  // Define columns for Tanstack Table
  const columns: Column<Book>[] = React.useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title',
      },
      {
        Header: 'Author',
        accessor: 'author',
      },
      {
        Header: 'Description',
        accessor: 'description',
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
  } = useTable({
    columns,
    data: books,
  });

  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableCell {...column.getHeaderProps()}>
                  {column.render('Header')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell) => (
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
