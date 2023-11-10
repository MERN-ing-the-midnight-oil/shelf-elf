import React from 'react';
import { useTable, useSortBy } from 'react-table';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tooltip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { blue, red } from '@material-ui/core/colors';


const TruncatableText = ({ text }) => {
  const [isTruncated, setIsTruncated] = React.useState(true);
  const wordLimit = 15;

  const toggleTruncation = () => {
    setIsTruncated(!isTruncated);
  };

  const renderText = () => {
    if (typeof text === 'string') {
      if (isTruncated) {
        return (
          <>
            {text.split(' ').slice(0, wordLimit).join(' ')}
            <MoreHorizIcon style={{ color: 'blue', verticalAlign: 'middle' }} />
          </>
        );
      }
      return text;
    }
    return ''; // Or a placeholder text
  };

  return (
    <div onClick={toggleTruncation} style={{ cursor: 'pointer' }}>
      {renderText()}
    </div>
  );
};




const AvailableTable = ({ books, onRequestClick }) => {
  // Define columns
  const columns = React.useMemo(
    () => [
      { Header: 'Title', accessor: 'title' },
      { Header: 'Author', accessor: 'author' },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ value }) => <TruncatableText text={value} />
      },
      { Header: 'Offered by', accessor: 'owner.username' },
      // Action column not included here; we will handle it separately
    ],
    []
  );

  // Use the useTable Hook
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: books,
    initialState: { sortBy: [{ id: 'owner.username', desc: false }] } // Default sort by 'Offered by'
  }, useSortBy);
  
  // const headerStyle = {
  //   cursor: 'pointer',
  //   fontWeight: 'bold',  // Makes the text bold
  //   fontSize: '3rem'  // Adjusts the font size, increase the value for larger text
  // };
  
  
  
  // Render the UI for your table
  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
      <TableHead>
  {headerGroups.map(headerGroup => (
    <TableRow {...headerGroup.getHeaderGroupProps()}>
      {headerGroup.headers.map(column => (
        <Tooltip title="Click to sort" arrow>
          <TableCell 
            {...column.getHeaderProps(column.getSortByToggleProps())} 
            style={{ 
              cursor: 'pointer', 
              fontWeight: 'bold',  // Makes the text bold
              fontSize: '1.1rem'  // Adjusts the font size
            }}
          >
            {column.render('Header')}
            <span>
              {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
            </span>
          </TableCell>
        </Tooltip>
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
