import React, { useState, useEffect, useRef } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Button, TextField } from '@mui/material';
import ExistingCommunities from './ExistingCommunities';
import CreateNewCommunity from './CreateNewCommunity';
import GroupDetails from './GroupDetails';
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
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    const manageMembersRef = useRef<HTMLDivElement>(null);
    const editGroupRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);
    useEffect(() => {
        console.log("Managing community state updated:", managingCommunity);
    }, [managingCommunity]);

    useEffect(() => {
        isMounted.current = true;
        fetchUserCommunities();
        return () => {
            isMounted.current = false;
        };
    }, [token]);

    const fetchUserCommunities = async () => {
        try {
            setLoading(true);
            console.log('Fetching user communities...');
            const response = await axios.get(`${API_URL}/api/communities/user-communities`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (Array.isArray(response.data)) {
                console.log('Fetched user communities:', response.data);
                setUserCommunities(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setUserCommunities([]);
                setError('Failed to fetch your Lending Groups. Please try again later.');
            }
        } catch (err: any) {
            console.error('Error fetching user communities:', err.response?.data || err.message || err);
            setUserCommunities([]);
            setError('Failed to fetch your Lending Groups. Please try again later.');
        } finally {
            setLoading(false);
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
        console.log("Manage Members button clicked for community:", community);
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

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Your Lending Groups:
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                {loading ? (
                    <Typography>Loading...</Typography>
                ) : userCommunities.length > 0 ? (
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

            <CreateNewCommunity token={token} onCommunityCreated={fetchUserCommunities} />

            {/* ✅ Add GroupDetails.tsx for Managing Members */}
            {managingCommunity && (
                <Box ref={manageMembersRef} sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
                    <Typography variant="h5" gutterBottom>
                        Managing Members for {managingCommunity.name}
                    </Typography>
                    <GroupDetails
                        token={token}
                        groupId={managingCommunity._id}
                        creatorId={managingCommunity.creatorId}
                        userId={userId}
                    />
                </Box>
            )}
        </Box>
    );

};

export default ManageCommunities;
