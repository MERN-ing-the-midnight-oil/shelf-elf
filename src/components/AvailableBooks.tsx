import React, { useEffect, useState } from 'react';
import { Typography, List, ListItem, Divider } from '@mui/material';

interface Book {
    title: string;
    author: string;
    description: string;
    imageUrl?: string;
    owner: string;
}

const AvailableBooks: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);

    useEffect(() => {
        console.log("Starting the fetch for AvailableBooks...");

        // Fetch the books available from other users
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        fetch(`${API_URL}/api/books/offeredByOthers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}` // Add the auth token
            }
        })
            .then(res => {
                console.log("Client Received response from server. Status code:", res.status);

                // If the response is not OK, throw an error to be caught in the catch block
                if (!res.ok) {
                    console.error("Response to AvailableBooks.tsx not OK. Status text:", res.statusText);
                    return res.text().then(text => {
                        throw new Error(text || "Error fetching books from server");
                    });
                }

                return res.json();
            })


            .then(data => {
                console.log("Received book data:", data);
                setBooks(data);
            })
            .catch(err => {
                console.error('Error fetching available books:', err);
            });
    }, []);


    return (
        <div>
            <Typography variant="h5">Books Available to Borrow:</Typography>
            <List>
                {books.map((book, index) => (
                    <div key={index}>
                        <ListItem>
                            <Typography variant="h6">{book.title}</Typography>
                            <Typography variant="subtitle1">by {book.author}</Typography>
                            {book.description && <Typography variant="body2">{book.description}</Typography>}
                        </ListItem>
                        <Divider />
                    </div>
                ))}
            </List>
        </div>
    );
}

export default AvailableBooks;
