//AvailableTable.jsx
import React from 'react';
import { useTable, useSortBy, useFilters, usePagination } from 'react-table';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tooltip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import '../App.css'; 



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
  // Define columns
const columns = React.useMemo(
  () => [
    {
      Header: 'Cover',
      accessor: 'imageUrl',
      Cell: ({ value }) => value ? <img src={value} alt="Book cover" style={{ height: 60 }} /> : null,
      disableFilters: true, 
      disableSortBy: true, 
    },
    {
      Header: 'Title',
      accessor: 'title',
      Filter: DefaultColumnFilter,
      // Enable sorting for this column
      disableSortBy: false,
    },
    {
      Header: 'Status',
      accessor: 'status',
      disableFilters: true,
      disableSortBy: true,
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
  
    
  ],
  []
);

const {
  getTableProps,
  getTableBodyProps,
  headerGroups,
  prepareRow,
  page, 
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize,
  state: { pageIndex, pageSize },
} = useTable(
  {
    columns,
    data: books,
    initialState: { pageIndex: 0 }, // Set page index to 0 (first page)
  },
  useFilters, 
  useSortBy,   
  usePagination 
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
    <>
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
             {headerGroup.headers.map(column => (
  <TableCell {...column.getHeaderProps(column.getSortByToggleProps())} className="tableHeader">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{column.render('Header')}</span>
      <span style={{ opacity: column.isSorted ? 1 : 0.3 }}>
        {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
      </span>
    </div>
    {column.canFilter && (
      <div style={{ paddingTop: '5px' }}> {/* Adjust padding as needed */}
        {renderFilter(column)}
      </div>
    )}
  </TableCell>
))}


              <TableCell>Action</TableCell>
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
  {page.map(row => {
    prepareRow(row);
    const book = row.original; // Access the original row data
    return (
      <TableRow {...row.getRowProps()}>
        {row.cells.map(cell => (
          <TableCell {...cell.getCellProps()}>
            {cell.render('Cell')}
          </TableCell>
        ))}
        <TableCell align="right">
          {book.status === 'available' ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onRequestClick(book)}
            >
              Request!
            </Button>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Unavailable
            </Typography>
          )}
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>

      </Table>
    </TableContainer>
    <div className="pagination">
    <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
      {'<<'}
    </button>{' '}
    <button onClick={() => previousPage()} disabled={!canPreviousPage}>
      {'<'}
    </button>{' '}
    <button onClick={() => nextPage()} disabled={!canNextPage}>
      {'>'}
    </button>{' '}
    <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
      {'>>'}
    </button>{' '}
    <span>
      Page{' '}
      <strong>
        {pageIndex + 1} of {pageOptions.length}
      </strong>{' '}
    </span>
    <span>
      | Go to page:{' '}
      <input
        type="number"
        defaultValue={pageIndex + 1}
        onChange={e => {
          const page = e.target.value ? Number(e.target.value) - 1 : 0;
          gotoPage(page);
        }}
        style={{ width: '50px' }}
      />
    </span>{' '}
    <select
      value={pageSize}
      onChange={e => {
        setPageSize(Number(e.target.value));
      }}
    >
      {[10, 20, 30, 40, 50].map(pageSize => (
        <option key={pageSize} value={pageSize}>
          Show {pageSize}
        </option>
      ))}
    </select>
  </div>
</>  
  );
  
  
  
  
};

export default AvailableTable;
