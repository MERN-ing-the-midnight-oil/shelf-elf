//Displays the books offered by a single user

import React, { useEffect, useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BlockIcon from '@mui/icons-material/Block';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Tooltip, Typography } from '@mui/material';


interface Request {
  userID: string;
  username: string;
}

interface Book {
  _id: string;
  googleBooksId: string;
  title: string;
  author: string;
  requestedBy: Request[];  // This field is an array of user IDs.
  status: string;  // Add this line
  imageUrl: string;
}


interface MyLendingLibraryProps {
  token: string | null;
  setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
  refetchCounter: number;
}

const MyLendingLibrary: React.FC<MyLendingLibraryProps> = ({ token, setRefetchCounter, refetchCounter }) => {
  const [myBooks, setMyBooks] = useState<Book[]>([]);

  const fetchBooksOwnedByUser = async () => {
    if (!token) {
      console.error('Token not provided.');
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/books/my-library`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        console.error('Server response:', response.statusText);
        return;
      }
      const data: Book[] = await response.json();
      setMyBooks(data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };


  const handleMarkAsUnavailable = async (id: string) => {
    if (!token) {
      console.error('Token not provided.');
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/books/unavailable/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Re-fetch books to update the UI
        setRefetchCounter(prev => prev + 1);  // Increment the counter
      } else {
        console.error('Failed to mark book as unavailable');
      }
    } catch (error) {
      console.error('Failed to mark book as unavailable:', error);
    }
  };

  // Add the handleMarkAsAvailable function
  const handleMarkAsAvailable = async (id: string) => {
    if (!token) {
      console.error('Token not provided.');
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/books/available/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Re-fetch books to update the UI
        setRefetchCounter(prev => prev + 1);
      } else {
        console.error('Failed to mark book as available');
      }
    } catch (error) {
      console.error('Failed to mark book as available:', error);
    }
  };

  const handleDeleteForever = async (id: string) => {
    if (!token) {
      console.error('Token not provided.');
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/books/delete-offer/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Re-fetch books to update the UI
        setRefetchCounter(prev => prev + 1);
      } else {
        console.error('Failed to delete book permanently');
      }
    } catch (error) {
      console.error('Failed to delete book permanently:', error);
    }
  };




  useEffect(() => {
    fetchBooksOwnedByUser();
  }, []); // Empty dependency array to run once on mount
  useEffect(() => {
    fetchBooksOwnedByUser();
  }, [refetchCounter]);

  return (
    <div>
      {myBooks.length === 0 ? (
        <p>You don't have any books in your offerings library yet.</p>
      ) : (
        <>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }, // Adjust font size
                fontWeight: 'bold',
                color: '#333',
                wordWrap: 'break-word',
              }}
            >
              You are offering to lend the following books:
            </Typography>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              overflowX: 'auto', // Enable horizontal scrolling for small screens
              maxWidth: '100%',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cover</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Author</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Requested By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myBooks.map((book) => (
                  <TableRow
                    key={book._id || book.googleBooksId}
                    sx={{
                      backgroundColor: book.status === 'unavailable' ? '#e0e0e0' : '',
                    }}
                  >
                    <TableCell>
                      {book.imageUrl && (
                        <img src={book.imageUrl} alt="Book cover" style={{ height: 60 }} />
                      )}
                    </TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{book.author}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {book.requestedBy && book.requestedBy.length > 0
                        ? book.requestedBy.map((request) => request.username).join(', ')
                        : 'No current requests.'}
                    </TableCell>
                    <TableCell>{book.status}</TableCell>
                    <TableCell align="right">
                      {book.status === 'unavailable' ? (
                        <Tooltip title="Mark as Available">
                          <span>
                            <IconButton
                              onClick={() => handleMarkAsAvailable(book._id)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Mark as Unavailable">
                          <span>
                            <IconButton
                              onClick={() => handleMarkAsUnavailable(book._id)}
                              color="warning"
                            >
                              <BlockIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete Forever">
                        <IconButton onClick={() => handleDeleteForever(book._id)} color="error">
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>


        </>
      )}
    </div>
  );
};

export default MyLendingLibrary;