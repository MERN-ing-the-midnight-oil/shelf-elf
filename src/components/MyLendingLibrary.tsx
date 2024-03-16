//Displays the books offered by a single user

import React, { useEffect, useState } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BlockIcon from '@mui/icons-material/Block';
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
          <h1>You are offering to lend the following books:</h1>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cover</TableCell> {/* Add this line for the new "Cover" column header */}
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myBooks.map((book) => (
                  <TableRow key={book._id || book.googleBooksId} style={{ backgroundColor: book.status === 'unavailable' ? '#e0e0e0' : '' }}>
                    <TableCell>
                      {/* Check if imageUrl exists and display it as an image */}
                      {book.imageUrl && (
                        <img src={book.imageUrl} alt="Book cover" style={{ height: 60 }} /> // Adjust size as needed
                      )}
                    </TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      {book.requestedBy && book.requestedBy.length > 0
                        ? book.requestedBy.map((request) => request.username).join(', ')
                        : 'No current requests.'}
                    </TableCell>
                    <TableCell>{book.status}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Mark as Unavailable">
                        <span>
                          <IconButton onClick={() => handleMarkAsUnavailable(book._id)} color="warning" disabled={book.status === 'unavailable'}>
                            <BlockIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
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