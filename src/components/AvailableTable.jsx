import React from 'react';
import { useTable, useSortBy, useFilters } from 'react-table';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tooltip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import '../App.css'; // Adjust the path based on your project structure



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


const DefaultColumnFilter = ({ column: { filterValue, setFilter } }) => {
  return (
    <input
      value={filterValue || ''}
      onChange={e => setFilter(e.target.value || undefined)}
      placeholder={`Search...`}
    />
  );
};



const AvailableTable = ({ books, onRequestClick }) => {
    // Simulated state for testing the filter
    const [testFilterValue, setTestFilterValue] = React.useState('');
  // Define columns
const columns = React.useMemo(
  () => [
    {
      Header: 'Title',
      accessor: 'title',
      Filter: DefaultColumnFilter,
      // Enable sorting for this column
      disableSortBy: false,
    },
    {
      Header: 'Author',
      accessor: 'author',
      Filter: DefaultColumnFilter,
      // Enable sorting for this column
      disableSortBy: false,
    },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: ({ value }) => <TruncatableText text={value} />,
      // Disable sorting for 'Description'
      disableSortBy: true,
    },
    {
      Header: 'Offered by',
      accessor: 'owner.username',
      Filter: DefaultColumnFilter,
      // Enable sorting for this column
      disableSortBy: false,
    },
    // ... other columns
  ],
  []
);

const {
  getTableProps,
  getTableBodyProps,
  headerGroups,
  rows,
  prepareRow,
} = useTable(
  {
    columns,
    data: books,
  },
  useFilters, // for filtering
  useSortBy   // for sorting
);


  const renderFilter = (column) => {
    // Only render the filter UI if the column has a filter component defined
    if (column.canFilter && column.Filter) {
      try {
        return column.render('Filter');
      } catch (error) {
        console.error("Error rendering filter UI:", error);
      }
    }
    // Return null if no filter is defined for the column
    return null;
  };
  
  
  
  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
  <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}className="tableHeader">
    {column.render('Header')}
    {/* Add a sort direction indicator */}
    <span>
      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
    </span>
    {/* Render filter UI */}
    {renderFilter(column)}
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
