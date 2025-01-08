import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Box,
    Paper,
} from '@mui/material';

interface Community {
    _id: string;
    name: string;
    description: string;
    membersCount: number;
}

const CommunitiesTable: React.FC = () => {
    const [communities, setCommunities] = useState<Community[]>([]);

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                const response = await axios.get(`${API_URL}/api/communities/admin-list`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Include token in header
                });
                setCommunities(response.data);
            } catch (error) {
                console.error('Error fetching communities:', error);
            }
        };


        fetchCommunities();
    }, []);

    const handleDelete = async (communityId: string) => {
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            await axios.delete(`${API_URL}/api/communities/${communityId}`);
            setCommunities((prev) => prev.filter((community) => community._id !== communityId));
        } catch (error) {
            console.error('Error deleting community:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Manage Communities
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Members</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {communities.map((community) => (
                            <TableRow key={community._id}>
                                <TableCell>{community.name}</TableCell>
                                <TableCell>{community.description}</TableCell>
                                <TableCell>{community.membersCount}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleDelete(community._id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CommunitiesTable;
