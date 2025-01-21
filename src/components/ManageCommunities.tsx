import React, { useState, useEffect, useRef } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Button, TextField } from '@mui/material';
import ExistingCommunities from './ExistingCommunities'; // Import ExistingCommunities
import CreateNewCommunity from './CreateNewCommunity'; // Import CreateNewCommunity
import axios from 'axios';

interface Community {
    _id: string;
    name: string;
    description: string;
    creatorId: string;
    passcode: string;
    members: Array<{ _id: string; username: string }>;
}

interface ManageCommunitiesProps {
    token: string;
    userId: string;
}

const ManageCommunities: React.FC<ManageCommunitiesProps> = ({ token, userId }) => {
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    const [managingCommunity, setManagingCommunity] = useState<Community | null>(null);
    const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    const manageMembersRef = useRef<HTMLDivElement>(null);
    const editGroupRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        fetchUserCommunities();

        return () => {
            isMounted.current = false;
        };
    }, [token]);

    const fetchUserCommunities = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/communities/user-communities`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (isMounted.current) {
                setUserCommunities(response.data);
            }
        } catch (error) {
            console.error('Error fetching user communities:', error);
            if (isMounted.current) {
                alert('Failed to fetch your Lending Groups.');
            }
        }
    };

    const handleLeaveCommunity = async (communityId: string) => {
        if (!window.confirm('Are you sure you want to leave this community?')) return;
        try {
            await axios.post(
                `${API_URL}/api/communities/${communityId}/leave`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('You have left the community.');
            fetchUserCommunities();
        } catch (error) {
            console.error('Error leaving community:', error);
            alert('Failed to leave the community.');
        }
    };

    const handleManageMembers = (community: Community) => {
        setManagingCommunity(community);
        setTimeout(() => {
            manageMembersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    const handleEditCommunity = (community: Community) => {
        setEditingCommunity(community);
        setTimeout(() => {
            editGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    return (
        <Box sx={{ maxWidth: '600px', margin: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom textAlign="center">
                Manage Your Lending Groups
            </Typography>

            {/* User's Communities */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Your Lending Groups:
                </Typography>
                {userCommunities.length > 0 ? (
                    <List>
                        {userCommunities.map((community) => (
                            <ListItem key={community._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <ListItemText
                                    primary={community.name}
                                    secondary={community.description}
                                />
                                <Box>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleLeaveCommunity(community._id)}
                                    >
                                        Leave Lending Group
                                    </Button>
                                    {community.creatorId === userId && (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleManageMembers(community)}
                                                sx={{ ml: 2 }}
                                            >
                                                Manage Members
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="info"
                                                onClick={() => handleEditCommunity(community)}
                                                sx={{ ml: 2 }}
                                            >
                                                Edit Group Info
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography>You are not a member of any Lending Groups.</Typography>
                )}
            </Box>

            {/* Existing Communities */}
            <ExistingCommunities
                token={token}
                onCommunityJoin={async (communityId, passcode) => {
                    try {
                        await axios.post(
                            `${API_URL}/api/communities/join`,
                            { communityId, passcode },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        alert('Successfully joined the community.');
                        fetchUserCommunities();
                    } catch (error) {
                        console.error('Error joining community:', error);
                        alert('Failed to join the community.');
                    }
                }}
            />

            {/* Create a New Community */}
            <CreateNewCommunity token={token} onCommunityCreated={fetchUserCommunities} />

            {/* Manage Members Section */}
            {managingCommunity && (
                <Box ref={manageMembersRef} sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Manage Members for {managingCommunity.name}
                    </Typography>
                    <List>
                        {managingCommunity.members.map((member) => (
                            <ListItem key={member._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <ListItemText primary={member.username} />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => console.log('Remove', member.username)}
                                >
                                    Remove
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setManagingCommunity(null)}
                        sx={{ mt: 2 }}
                    >
                        Done
                    </Button>
                </Box>
            )}

            {/* Edit Group Info Modal */}
            {editingCommunity && (
                <Box ref={editGroupRef} sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Edit Group Info for {editingCommunity.name}
                    </Typography>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const updatedName = formData.get('name') as string;
                            const updatedDescription = formData.get('description') as string;
                            const updatedPasscode = formData.get('passcode') as string;

                            try {
                                await axios.put(
                                    `${API_URL}/api/communities/${editingCommunity._id}/update`,
                                    { name: updatedName, description: updatedDescription, passcode: updatedPasscode },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                );
                                alert('Community updated successfully.');
                                setEditingCommunity(null);
                                fetchUserCommunities(); // Refresh communities
                            } catch (error) {
                                console.error('Error updating community:', error);
                                alert('Failed to update community.');
                            }
                        }}
                    >
                        <TextField
                            label="Group Name"
                            defaultValue={editingCommunity.name}
                            name="name"
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Description"
                            defaultValue={editingCommunity.description}
                            name="description"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Passcode"
                            defaultValue={editingCommunity.passcode}
                            name="passcode"
                            type="password"
                            fullWidth
                            margin="normal"
                        />
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                            Save Changes
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setEditingCommunity(null)}
                            sx={{ mt: 2 }}
                        >
                            Cancel
                        </Button>
                    </form>
                </Box>
            )}
        </Box>
    );
};

export default ManageCommunities;
