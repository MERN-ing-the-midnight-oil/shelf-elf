//AvailableBooks.tsx
import React, { useEffect, useState } from 'react';
import {
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';

import AvailableTable from './AvailableTable';

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

const AvailableBooks: React.FC<AvailableBooksProps> = ({ setRefetchCounter }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [requestedBooks, setRequestedBooks] = useState<Book[]>([]); // New state for tracking requested books
    // ...other states and useEffect
    useEffect(() => {
        // console.log("Starting the fetch for AvailableBooks...");

        // Fetch the books available from other users
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        fetch(`${API_URL}/api/books/offeredByOthers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        })
            .then(res => {
                // console.log("Client Received response from server. Status code:", res.status);

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
                // console.log("Received book data:", data);
                setBooks(data);
            })
            .catch(err => {
                console.error('Error fetching available books:', err);
            });
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

            if (response.ok) {
                console.log("Book requested successfully");
                // Trigger refetch in MyRequestedBooks
                setRefetchCounter(prev => prev + 1);
            } else {
                // If the request failed, revert the optimistic update
                setRequestedBooks(prevBooks => prevBooks.filter(book => book._id !== selectedBook._id));
                console.error("Error requesting the book:", await response.json());
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
            <Typography variant="h5">Books that you can request to borrow from other users:</Typography>
            <AvailableTable books={books} onRequestClick={handleRequestClick} />


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