import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommunityForm from './CommunityForm';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Button } from '@mui/material';

interface Community {
    _id: string;
    name: string;
    description: string;
    members: string[];
}

interface ManageCommunitiesProps {
    token: string;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
    refetchCounter: number;
}

const ManageCommunities: React.FC<ManageCommunitiesProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    const [joinPasscodes, setJoinPasscodes] = useState<{ [key: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

        // Fetch all communities available for joining
        const fetchAllCommunities = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/communities/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.status === 200) {
                    setCommunities(response.data);
                } else {
                    console.error('Failed to fetch all communities');
                }
            } catch (error) {
                console.error('Error fetching communities:', error);
            }
        };

        // Fetch communities that the user is already a member of
        const fetchUserCommunities = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/communities/user-communities`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.status === 200) {
                    setUserCommunities(response.data);
                } else {
                    console.error('Failed to fetch user communities');
                }
            } catch (error) {
                console.error('Error fetching user communities:', error);
            }
        };

        fetchAllCommunities();
        fetchUserCommunities();
    }, [token, refetchCounter]);


    const handleJoinCommunity = async (communityId: string) => {
        const passcode = joinPasscodes[communityId];
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        try {
            await axios.post(`${API_URL}/api/communities/join`, { communityId, passcode }, { headers: { Authorization: `Bearer ${token}` } });
            setRefetchCounter(prev => prev + 1); // Trigger re-fetch
            // Optionally, clear the passcode input field
            setJoinPasscodes(prev => ({ ...prev, [communityId]: '' }));
        } catch (error) {
            console.error('Error joining community:', error);
            // Handle error
        }
    };

    const updatePasscode = (communityId: string, passcode: string) => {
        setJoinPasscodes(prev => ({ ...prev, [communityId]: passcode }));
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div>
            <h1>Join or Create a Social Group</h1>

            <h2>Your Social Groups:</h2>
            {userCommunities.length > 0 ? (
                <ul>
                    {userCommunities.map((community) => (
                        <li key={community._id}>{community.name} - {community.description}</li>
                    ))}
                </ul>
            ) : (
                <p>You are not part of any social groups yet.</p>
            )}


            <h2>Join an Existing Social Group</h2>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Community Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Passcode</TableCell>
                            <TableCell>Join</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {communities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((community) => (
                            <TableRow key={community._id}>
                                <TableCell>{community.name}</TableCell>
                                <TableCell>{community.description}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="password"
                                        placeholder="Enter passcode"
                                        value={joinPasscodes[community._id] || ''}
                                        onChange={(e) => updatePasscode(community._id, e.target.value)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleJoinCommunity(community._id)}
                                    >
                                        Join
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={communities.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <h2>Don't see your group? Create a new social group!</h2>
            <CommunityForm token={token} setRefetchCounter={setRefetchCounter} />
        </div>
    );
};

export default ManageCommunities;
