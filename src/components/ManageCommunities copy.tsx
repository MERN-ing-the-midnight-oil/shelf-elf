import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Button, Typography, Box } from '@mui/material';
import CommunityForm from './CommunityForm';

interface Community {
    _id: string;
    name: string;
    description: string;
    members: string[];
}

interface Props {
    token: string;
}

const ManageCommunities: React.FC<Props> = ({ token }) => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    const [joinPasscodes, setJoinPasscodes] = useState<{ [key: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [CommrefetchCounter, setCommRefetchCounter] = useState<number>(0); // Own refetch counter with a more defined type

    useEffect(() => {
        console.log("useEffect triggered with token:", token, "and refetchCounter:", CommrefetchCounter);
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

        const fetchCommunities = async () => {
            try {
                const allCommunitiesResponse = await axios.get(`${API_URL}/api/communities/list`, { headers: { Authorization: `Bearer ${token}` } });
                setCommunities(allCommunitiesResponse.data);

                const userCommunitiesResponse = await axios.get(`${API_URL}/api/communities/user-communities`, { headers: { Authorization: `Bearer ${token}` } });
                setUserCommunities(userCommunitiesResponse.data);
            } catch (error) {
                console.error('Error fetching communities:', error);
            }
        };

        fetchCommunities();
    }, [token, CommrefetchCounter]); // Dependency array now includes the component's own refetchCounter

    const handleJoinCommunity = async (communityId: string) => {
        console.log("handleJoinCommunity called. The starting refetchCounter value:", CommrefetchCounter); // Log the current value of refetchCounter
        try {
            const passcode = joinPasscodes[communityId];
            if (!passcode) {
                alert('Please enter a passcode.');
                return;
            }
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await axios.post(`${API_URL}/api/communities/join`, {
                communityId,
                passcode,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert('Successfully joined the community!');
                handleRefetch();
                console.log("handleRefetch has been called within handleJoinCommunity. Current refetchCounter value:", CommrefetchCounter); // Log the current value of refetchCounter

            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error joining community:', error);
            alert('An error occurred while trying to join the community.');
        }
    };


    const handleRefetch = () => {
        setCommRefetchCounter(prev => prev + 1);
        console.log("Refetch counter should be incremented.");
    };

    // Add the filteredCommunities calculation right before the return statement
    const filteredCommunities = communities.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Define the missing handlers if not already defined
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Join or Create a Social Group
            </Typography>

            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Your Social Groups:
            </Typography>
            {userCommunities.length > 0 ? (
                <ul>
                    {userCommunities.map((community) => (
                        <li key={community._id}>{community.name} - {community.description}</li>
                    ))}
                </ul>
            ) : (
                <Typography>You are not part of any social groups yet.</Typography>
            )}

            <Box sx={{ my: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for a social group..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>

            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Join an Existing Social Group
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Social Group </TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Passcode</TableCell>
                            <TableCell>Join</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCommunities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((community) => (
                            <TableRow key={community._id}>
                                <TableCell>{community.name}</TableCell>
                                <TableCell>{community.description}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="password"
                                        placeholder="Enter passcode"
                                        value={joinPasscodes[community._id] || ''}
                                        onChange={(e) => setJoinPasscodes({ ...joinPasscodes, [community._id]: e.target.value })}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button variant="contained" color="primary" onClick={() => handleJoinCommunity(community._id)}>
                                        Join
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredCommunities.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 4 }}>
                Don't see your group? Create a new social group!
                <CommunityForm token={token} onRefetch={handleRefetch} />
            </Typography>
        </div>
    );
};

export default ManageCommunities;
