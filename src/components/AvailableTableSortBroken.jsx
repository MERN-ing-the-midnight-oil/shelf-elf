import { useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
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
  const tableInstance = useTable({ columns, data }, useSortBy);
  // Use the useTable Hook to send the columns and data to build the table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  // Render UI for your table
  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                // Add the sorting props to the cell props destructuring
                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        {/* ...rest of your table */}
      </Table>
    </TableContainer>
  );
};

export default AvailableTable;