// AvailableBooks.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import AvailableTable from './AvailableTable';
import axios from 'axios';

interface AvailableBooksProps {
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
}

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

interface Community {
    _id: string;
    name: string;
    description: string;
}

const AvailableBooks: React.FC<AvailableBooksProps> = ({ setRefetchCounter }) => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [booksInCommunities, setBooksInCommunities] = useState<Map<string, Book[]>>(new Map());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [requestedBooks, setRequestedBooks] = useState<Book[]>([]);

    useEffect(() => {
        const fetchUserCommunities = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const response = await axios.get('/api/users/my-communities', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCommunities(response.data);
            } catch (error) {
                console.error('Error fetching communities:', error);
            }
        };
        fetchUserCommunities();
    }, []);

    useEffect(() => {
        communities.forEach(community => {
            const fetchBooksForCommunity = async () => {
                try {
                    const token = localStorage.getItem('userToken');
                    const response = await axios.get(`/api/books/offeredInCommunity/${community._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setBooksInCommunities(prev => new Map(prev.set(community._id, response.data)));
                } catch (error) {
                    console.error(`Error fetching books for community ${community.name}:`, error);
                }
            };
            fetchBooksForCommunity();
        });
    }, [communities]);



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
            <Typography variant="h5">Books available in your communities:</Typography>
            {communities.map(community => (
                <div key={community._id}>
                    <Typography variant="h6">{community.name}</Typography>
                    <AvailableTable
                        books={booksInCommunities.get(community._id) || []}
                        onRequestClick={handleRequestClick}
                    />
                </div>
            ))}

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