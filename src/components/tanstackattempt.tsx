import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Avatar,
} from '@mui/material';

import {
    Column,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { ColumnDef } from '@tanstack/react-table';



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

const AvailableBooks: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    useEffect(() => {
        // console.log("Starting the fetch for AvailableBooks...");
        let isComponentMounted = true;
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
                if (isComponentMounted) {
                    setBooks(data);
                }
            })
            .catch(err => {
                if (isComponentMounted) {
                    console.error('Error fetching available books:', err);
                }
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

        // console.log("Selected Book for Request:", selectedBook);

        // Assuming you have the token available in your component's context or state
        const token = localStorage.getItem('userToken');
        // console.log("User Token:", token);

        // Define the API base URL
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

        // Define the endpoint URL
        const requestURL = `${API_URL}/api/books/request/${selectedBook._id}`;
        // console.log("Requesting URL:", requestURL);

        try {
            const response = await fetch(requestURL, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // console.log("Full HTTP Response:", response);

            const responseData = await response.json();

            if (response.ok) {
                console.log("Book requested successfully:", responseData);
                // update state
                // or re-fetch the book data here to reflect the changes.
            } else {
                console.error("Error requesting the book:", responseData.error);
            }

        } catch (error) {
            console.error("An error occurred while making the PATCH request:", error);
        }

        // Close the dialog after making the request
        setIsDialogOpen(false);
    };

    const columns: ColumnDef<Book>[] = React.useMemo(
        () => [
            {
                id: 'title',
                header: 'Title',
                accessorFn: (row) => row.title,
            },
            {
                id: 'author',
                header: 'Author',
                accessorFn: (row) => row.author,
            },
            {
                id: 'description',
                header: 'Description',
                accessorFn: (row) => row.description,
            },
            {
                id: 'imageUrl',
                header: 'Image',
                accessorFn: (row) => row.imageUrl,
                cell: ({ getValue }) => {
                    const value = getValue() as string; // Asserting the value is a string
                    return value ? <img src={value} alt="Book" style={{ width: '50px' }} /> : null;
                },
            },
            {
                id: 'owner',
                header: 'Owner',
                accessorFn: (row) => row.owner.username,
            },
            {
                id: '_id',
                header: 'ID',
                accessorFn: (row) => row._id,
            },
        ],
        []
    );


    const tableInstance = useReactTable({
        columns,
        data: books,
        getCoreRowModel: getCoreRowModel(),
    });

    console.log("the table instance is :", tableInstance);

    // Destructure properties and methods from tableInstance to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance as any;



    return (
        <div>
            {/* ... (the rest of your component) */}

            <Table {...getTableProps()}>
                <TableHead>
                    {headerGroups.map((headerGroup: any) => (
                        <TableRow {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column: any) => (
                                <TableCell {...column.getHeaderProps()}>{column.render('Header')}</TableCell>
                            ))}
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody {...getTableBodyProps()}>
                    {rows.map((row: any) => {
                        prepareRow(row);
                        return (
                            <TableRow {...row.getRowProps()}>
                                {row.cells.map((cell: any) => (
                                    <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                                ))}
                                <TableCell>
                                    <Button onClick={() => handleRequestClick(row.original)} color="primary">
                                        Request
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

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
                    <Button onClick={handleConfirmRequest} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AvailableBooks;
