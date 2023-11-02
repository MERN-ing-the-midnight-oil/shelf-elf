// src/components/MyRequestedBooks.tsx
import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Book {
    _id: string;
    title: string;
    author: string;
}

interface User {
    _id: string;
    username: string;
    requestedBooks: Book[];
}

const MyRequestedBooks: React.FC<{ token: string | null }> = ({ token }) => {
    const { user } = useAuth() as { user: User | null }; // Assert the type 
    const [requestedBooks, setRequestedBooks] = useState<Book[]>([]);

    useEffect(() => {
        const fetchRequestedBooks = async () => {
            console.log("Initiating fetch request to /api/users/requested-books");
            console.log("User:", user); // Log the user object
            console.log("Token:", token); // Log the token

            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

            if (user && token) { // Ensure user and token are not null before proceeding
                try {
                    console.log("The token being submitted in fetchRequestedBooks is: ", token);
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


    }, [user, token]); // Depend on user and token

    return (
        <div>
            <Typography variant="h5">You have requested to borrow the following books:</Typography>
            <ul>
                {requestedBooks.map((book) => (
                    <li key={book._id}>{book.title} by {book.author}</li>
                ))}
            </ul>
        </div>
    );
};

export default MyRequestedBooks;
