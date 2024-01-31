//MyRequestedBooks.tsx

import React, { useEffect, useState } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface MyRequestedBooksProps {
    token: string | null;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
    refetchCounter: number;
}

interface Owner {
    _id: string;
    username: string;
    street1: string;
    street2: string;
    zipCode: string;
}

interface Book {
    _id: string;
    title: string;
    author: string;
    description: string;
    imageUrl: string;
    status: string;
    owner: Owner;
}

interface User {
    _id: string;
    username: string;
    requestedBooks: Book[];
}

const MyRequestedBooks: React.FC<MyRequestedBooksProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const { user } = useAuth() as { user: User | null };
    const [requestedBooks, setRequestedBooks] = useState<Book[]>([]);

    useEffect(() => {
        const fetchRequestedBooks = async () => {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            if (user && token) {
                try {
                    const response = await axios.get(`${API_URL}/api/users/requested-books`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setRequestedBooks(response.data);
                } catch (error) {
                    console.error("Failed to fetch requested books:", error);
                }
            }
        };
        fetchRequestedBooks();
    }, [refetchCounter, token, user]);

    const generateGoogleMapsLink = (street1: string, street2: string, zipCode: string) => {
        const query = encodeURIComponent(`${street1} and ${street2}, ${zipCode}`);
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    };

    const getDescriptionPreview = (description: string) => {
        return description.length > 100 ? `${description.substring(0, 100)}...` : description;
    };

    const handleDelete = async (bookId: string) => {
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        if (token) {
            try {
                const response = await axios.delete(`${API_URL}/api/books/${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequestedBooks(requestedBooks.filter(book => book._id !== bookId));
            } catch (error) {
                console.error("Failed to delete book:", error);
            }
        }
    };

    return (
        <div>
            <Typography variant="h5">You have requested to borrow the following books:</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="requested books table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Cover</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Author</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Offered By</TableCell>
                            <TableCell>Location</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requestedBooks.map((book) => (
                            <TableRow key={book._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    {book.imageUrl && (
                                        <img src={book.imageUrl} alt={`${book.title} cover`} style={{ width: '100px', height: '150px' }} />
                                    )}
                                </TableCell>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.author}</TableCell>
                                <TableCell>{getDescriptionPreview(book.description)}</TableCell>
                                <TableCell>{book.status}</TableCell>
                                <TableCell>{book.owner.username}</TableCell>
                                <TableCell>
                                    <a href={generateGoogleMapsLink(book.owner.street1, book.owner.street2, book.owner.zipCode)} target="_blank" rel="noopener noreferrer">
                                        {`${book.owner.street1} & ${book.owner.street2}, ${book.owner.zipCode}`}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleDelete(book._id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default MyRequestedBooks;
