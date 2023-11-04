//Displays the books offered by a single user

import React, { useEffect, useState } from 'react';
//import DeleteIcon from '@mui/icons-material/Delete';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Tooltip } from '@mui/material';


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
          <h1>You are offering to lend the following books:</h1>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Status</TableCell> {/* Add this column */}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myBooks.map((book) => (
                  <TableRow key={book._id || book.googleBooksId} style={{ backgroundColor: book.status === 'unavailable' ? '#f0f0f0' : '' }}> {/* Grey out unavailable books */}
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      {book.requestedBy && book.requestedBy.length > 0
                        ? book.requestedBy.map((request) => request.username).join(', ')
                        : 'No current requests.'}
                    </TableCell>
                    <TableCell>{book.status}</TableCell> {/* Display book status */}
                    <TableCell align="right">
                      {book.status !== 'unavailable' && ( // Only show action if book is not unavailable
                        <Tooltip title="Mark as unavailable">
                          <IconButton onClick={() => {
                            if (window.confirm('Are you sure you want to mark this book as unavailable?')) {
                              handleMarkAsUnavailable(book._id);
                            }
                          }} color="error">
                            <NotInterestedIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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

