import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Box, List, ListItem } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails, } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Community {
    _id: string;
    name: string;
    description: string;
}

interface ManageCommunitiesProps {
    token: string;
}

const ManageCommunities: React.FC<ManageCommunitiesProps> = ({ token }) => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

    useEffect(() => {
        const fetchCommunities = async () => {
            const allCommunitiesResponse = await axios.get(`${API_URL}/api/communities/list`, { headers: { Authorization: `Bearer ${token}` } });
            setCommunities(allCommunitiesResponse.data);

            const userCommunitiesResponse = await axios.get(`${API_URL}/api/communities/user-communities`, { headers: { Authorization: `Bearer ${token}` } });
            setUserCommunities(userCommunitiesResponse.data);
        };

        fetchCommunities();
    }, [token, API_URL]);

    const handleJoinCommunity = async (communityId: string, joinCode: string) => {
        try {
            await axios.post(
                `${API_URL}/api/communities/join`,
                { communityId, passcode: joinCode },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Joined community successfully.');
            // Refetch user communities to update the list
            const userCommunitiesResponse = await axios.get(`${API_URL}/api/communities/user-communities`, { headers: { Authorization: `Bearer ${token}` } });
            setUserCommunities(userCommunitiesResponse.data);
        } catch (error) {
            console.error('Error joining community:', error);
            // Existing error handling
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Manage Your Communities</Typography>
            <Typography variant="h5" gutterBottom>Your Communities:</Typography>
            <List>
                {userCommunities.map((community) => (
                    <ListItem key={community._id}>{community.name} - {community.description}</ListItem>
                ))}
            </List>

            <Typography variant="h6" gutterBottom>Join an Existing Community:</Typography>
            {communities.map((community) => (
                <Accordion key={community._id}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id={`panel1a-header-${community._id}`}
                    >
                        <Typography>{community.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body1">{community.description}</Typography>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // Use FormData to access the input value in a type-safe manner
                            const formData = new FormData(e.currentTarget);
                            const joinCode = formData.get('joinCode') as string; // Assuming the input's name is 'joinCode'
                            handleJoinCommunity(community._id, joinCode);
                        }}>
                            <TextField
                                name="joinCode"
                                label="Enter Join Code"
                                variant="outlined"
                                size="small"
                                margin="normal"
                            />
                            <Button variant="contained" color="primary" type="submit" sx={{ mt: 1 }}>
                                Join
                            </Button>
                        </form>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );

};

export default ManageCommunities;
