import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Button,
    TextField,
    Typography,
    Box,
    List,
    ListItem,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    ListItemText,
    SxProps
} from '@mui/material'; import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    const [newCommunityName, setNewCommunityName] = useState('');
    const [newCommunityPasscode, setNewCommunityPasscode] = useState('');
    const [newCommunityDescription, setNewCommunityDescription] = useState('');

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

    const fetchCommunities = async () => {
        const allCommunitiesResponse = await axios.get(`${API_URL}/api/communities/list`, { headers: { Authorization: `Bearer ${token}` } });
        setCommunities(allCommunitiesResponse.data);
        const userCommunitiesResponse = await axios.get(`${API_URL}/api/communities/user-communities`, { headers: { Authorization: `Bearer ${token}` } });
        setUserCommunities(userCommunitiesResponse.data);
    };

    useEffect(() => {
        const fetchCommunities = async () => {
            const allCommunitiesResponse = await axios.get(`${API_URL}/api/communities/list`, { headers: { Authorization: `Bearer ${token}` } });
            setCommunities(allCommunitiesResponse.data);
            const userCommunitiesResponse = await axios.get(`${API_URL}/api/communities/user-communities`, { headers: { Authorization: `Bearer ${token}` } });
            setUserCommunities(userCommunitiesResponse.data);
        };
        fetchCommunities();
    }, [token]); // Removed API_URL from dependencies as it's not expected to change


    const handleJoinCommunity = async (communityId: string, joinCode: string) => {
        try {
            await axios.post(`${API_URL}/api/communities/join`, { communityId, passcode: joinCode }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Joined group successfully.');
            fetchCommunities(); // Refresh communities list
        } catch (error) {
            console.error('Error joining community:', error);
            alert('Failed to join group.');
        }
    };

    const handleCreateCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/communities/create`, { name: newCommunityName, description: newCommunityDescription, passcode: newCommunityPasscode }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Group created successfully.');
            setNewCommunityName('');
            setNewCommunityDescription('');
            setNewCommunityPasscode('');
            fetchCommunities(); // Refresh communities list
        } catch (error) {
            console.error('Error creating community:', error);
            alert('Failed to create group.');
        }
    };

    const handleLeaveCommunity = async (communityId: string) => {
        if (!window.confirm('Are you sure you want to leave this community?')) return;

        try {
            await axios.post(`${API_URL}/api/communities/${communityId}/leave`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('You have left the community.');
            fetchCommunities(); // Refresh the list to show updated membership
        } catch (error) {
            console.error('Error leaving community:', error);
            alert('Failed to leave the community.');
        }
    };

    return (
        <Box sx={{ maxWidth: '600px', margin: 'auto', mt: 4 }}>
            {/* Manage Your Social Groups Header */}
            <Typography variant="h4" gutterBottom textAlign="center">Manage Your Social Groups</Typography>

            {/* Your Social Groups Section */}
            <Box
                sx={{
                    mb: 4,
                    p: 2,
                    boxShadow: 1,
                    borderRadius: '5px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #e0e0e0',
                }}
            >
                <Typography variant="h5" gutterBottom textAlign="center">
                    Your Social Groups:
                </Typography>
                {userCommunities.length > 0 ? (
                    <List>
                        {userCommunities.map((community) => (
                            <ListItem
                                key={community._id}
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                {/* Community Name and Description */}
                                <ListItemText
                                    primary={community.name}
                                    primaryTypographyProps={{ textAlign: 'center' }}
                                    secondary={community.description}
                                    secondaryTypographyProps={{ textAlign: 'center' }}
                                    sx={{ mb: { xs: 1, sm: 0 } }} // Add margin-bottom on mobile
                                />

                                {/* Leave Social Group Button */}
                                <Button
                                    color="secondary"
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleLeaveCommunity(community._id)}
                                    sx={{ width: { xs: '100%', sm: 'auto' } }} // Full-width on mobile
                                >
                                    Leave Social Group
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography textAlign="center">
                        You have not joined a Social Group yet. Ask another user for a Social Group name and join code, or if you
                        are the first one in your social group to use this app, please create a new Social Group.
                    </Typography>
                )}
            </Box>


            {/* Join an Existing Social Group Section */}
            <Box sx={{ mb: 4, backgroundColor: '#ffffff' }}>
                <Typography variant="h6" gutterBottom textAlign="center">Join an Existing Social Group:</Typography>
                {communities.map((community) => (
                    <Accordion key={community._id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id={`panel1a-header-${community._id}`}>
                            {/* Center the names of the Social Groups */}
                            <Typography textAlign="center">{community.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1" textAlign="center">{community.description}</Typography>
                            {/* Community join form */}
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const joinCode = formData.get('joinCode') as string;
                                handleJoinCommunity(community._id, joinCode);
                            }} style={{ textAlign: 'center' }}>
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

            {/* New Social Group Creation Form */}
            <Box sx={{ p: 2, boxShadow: 1, borderRadius: '5px', backgroundColor: '#e3f2fd', border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom textAlign="center">Don't see the Social Group you want to join? Create it!</Typography>
                <form onSubmit={handleCreateCommunity} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TextField
                        label="Create Group Name"
                        value={newCommunityName}
                        onChange={(e) => setNewCommunityName(e.target.value)}
                        variant="outlined"
                        size="small"
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        label="Description"
                        value={newCommunityDescription}
                        onChange={(e) => setNewCommunityDescription(e.target.value)}
                        variant="outlined"
                        size="small"
                        margin="normal"
                        fullWidth
                        multiline
                        rows={2}
                    />
                    <TextField
                        label="Create Passcode"
                        value={newCommunityPasscode}
                        onChange={(e) => setNewCommunityPasscode(e.target.value)}
                        type="password"
                        variant="outlined"
                        size="small"
                        margin="normal"
                        fullWidth
                    />
                    <Button variant="contained" color="primary" type="submit" sx={{ mt: 1 }}>
                        Create Social Group
                    </Button>
                </form>
            </Box>
        </Box>
    );

};

export default ManageCommunities;
