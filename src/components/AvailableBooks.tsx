// AvailableBooks.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import AvailableTable from './AvailableTable';
import axios from 'axios';
import { SharedComponentProps } from '../types'; // Adjust the import path as necessary


interface Owner {
    _id: string;
    username: string;
}

interface Book {
    _id: string;
    title: string;
    author: string;
    description: string;
    imageUrl?: string;
    owner: Owner;
}

const AvailableBooks: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {

    const [books, setBooks] = useState<Book[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [requestedBooks, setRequestedBooks] = useState<Book[]>([]);

    useEffect(() => {
        const fetchBooksFromAllCommunities = async () => {
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                const token = localStorage.getItem('userToken');
                const response = await axios.get(`${API_URL}/api/books/booksfromMyCommunities`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBooks(response.data);
            } catch (error) {
                console.error('Error fetching books from communities:', error);
            }
        };

        fetchBooksFromAllCommunities();
    }, []);



    const handleRequestClick = (book: Book) => {
        setSelectedBook(book);
        setIsDialogOpen(true);
    };

    const handleConfirmRequest = async () => {
        if (!selectedBook || !selectedBook._id) {
            console.error("Selected book or its ID is missing");
            return;
        }

        // Optimistic update: Add the selected book to requestedBooks
        setRequestedBooks(prevBooks => [...prevBooks, selectedBook]);

        const token = localStorage.getItem('userToken');
        const requestURL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/books/request/${selectedBook._id}`;

        try {
            const response = await fetch(requestURL, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // If the request failed, revert the optimistic update
                setRequestedBooks(prevBooks => prevBooks.filter(book => book._id !== selectedBook._id));
                console.error("Error requesting the book:", await response.json());
            } else {
                console.log("Book requested successfully");
                setRefetchCounter(prev => prev + 1);
            }
        } catch (error) {
            console.error("An error occurred while making the PATCH request:", error);
            // Revert optimistic update
            setRequestedBooks(prevBooks => prevBooks.filter(book => book._id !== selectedBook._id));
        }
        setIsDialogOpen(false);
    };




    return (
        <div>
            <Typography variant="h5"> Your friends are offering the following books:</Typography>
            <AvailableTable
                books={books}
                onRequestClick={handleRequestClick}
            />

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <DialogTitle>Confirm Request</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to request the book "{selectedBook?.title}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmRequest} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );


}

export default AvailableBooks;