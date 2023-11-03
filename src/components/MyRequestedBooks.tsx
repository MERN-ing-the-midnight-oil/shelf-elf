// src/components/MyRequestedBooks.tsx
import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Book {
    _id: string;
    title: string;
    author: string;
    description: string;
    imageUrl: string;
    status: string;
    owner: {
        _id: string;
        username: string;
    };
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
        // existing code
    }, [user, token]); // Depend on user and token

    const getDescriptionPreview = (description: string) => {
        // Get the first 100 characters or the full description if it's shorter
        return description.length > 100 ? `${description.substring(0, 100)}...` : description;
    };

    return (
        <div>
            <Typography variant="h5">You have requested to borrow the following books:</Typography>
            <div>
                {requestedBooks.map((book) => (
                    <div key={book._id} style={{ margin: '10px', padding: '10px', border: '1px solid #ccc' }}>
                        {book.imageUrl && (
                            <img src={book.imageUrl} alt={`${book.title} cover`} style={{ width: '100px', height: '150px' }} />
                        )}
                        <h3>{book.title}</h3>
                        <p>by {book.author}</p>
                        <p>{getDescriptionPreview(book.description)}</p>
                        <p>Status: {book.status}</p>
                        <p>Owned by: {book.owner.username}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyRequestedBooks;
