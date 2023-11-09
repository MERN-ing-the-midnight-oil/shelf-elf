import { useMemo } from 'react';
import { useTable } from 'react-table';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';


const AvailableTable = ({ books, onRequestClick }) => {
  const data = useMemo(() => books, [books]);

  const columns = useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title', // accessor is the "key" in the data
      },
      {
        Header: 'Author',
        accessor: 'author',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Offered by',
        accessor: 'owner.username', // accessing nested properties
      },
      {
        Header: 'Action',
        accessor: '_id',
        Cell: ({ row }) => (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onRequestClick(row.original)}
          >
            Request!
          </Button>
        ),
      },
    ],
    [onRequestClick]
  );
  
  // Use the useTable Hook to send the columns and data to build the table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  // Render UI for your table
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