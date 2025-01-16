import React, { useState, useEffect, useRef } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Button } from '@mui/material';
import ExistingCommunities from './ExistingCommunities'; // Import ExistingCommunities
import CreateNewCommunity from './CreateNewCommunity'; // Import CreateNewCommunity
import axios from 'axios';

interface Community {
    _id: string;
    name: string;
    description: string;
    creatorId: string;
    members: Array<{ _id: string; username: string }>;
}

interface ManageCommunitiesProps {
    token: string;
    userId: string;
}

const ManageCommunities: React.FC<ManageCommunitiesProps> = ({ token, userId }) => {
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    const [managingCommunity, setManagingCommunity] = useState<Community | null>(null);

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    const manageMembersRef = useRef<HTMLDivElement>(null); // Ref for the modal

    // Fetch user-specific communities
    const fetchUserCommunities = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/communities/user-communities`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Fetched user communities:", response.data); // Debug log
            setUserCommunities(response.data);
        } catch (error) {
            console.error("Error fetching user communities:", error);
            alert("Failed to fetch your social groups.");
        }
    };




    useEffect(() => {
        fetchUserCommunities();
    }, [token]);

    const handleLeaveCommunity = async (communityId: string) => {
        if (!window.confirm('Are you sure you want to leave this community?')) return;
        try {
            await axios.post(
                `${API_URL}/api/communities/${communityId}/leave`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('You have left the community.');
            fetchUserCommunities(); // Refresh user communities
        } catch (error) {
            console.error('Error leaving community:', error);
            alert('Failed to leave the community.');
        }
    };

    const handleManageMembers = (community: Community) => {
        setManagingCommunity(community);
        setTimeout(() => {
            manageMembersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0); // Scroll to modal after setting state
    };

    const handleRemoveMember = async (communityId: string, memberId: string) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await axios.post(
                `${API_URL}/api/communities/${communityId}/remove-member`,
                { memberId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Member removed successfully.');
            const updatedCommunity = {
                ...managingCommunity!,
                members: managingCommunity!.members.filter((member) => member._id !== memberId),
            };
            setManagingCommunity(updatedCommunity); // Update the community's members
            fetchUserCommunities(); // Refresh user communities
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member.');
        }
    };

    return (
        <Box sx={{ maxWidth: '600px', margin: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom textAlign="center">
                Manage Your Social Groups
            </Typography>

            {/* User's Communities */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Your Social Groups:
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
                                        Leave Social Group
                                    </Button>
                                    {community.creatorId === userId && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleManageMembers(community)}
                                            sx={{ ml: 2 }}
                                        >
                                            Manage Members
                                        </Button>
                                    )}
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography>You are not a member of any social groups.</Typography>
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
                        fetchUserCommunities(); // Refresh user communities
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
                                    onClick={() => handleRemoveMember(managingCommunity._id, member._id)}
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
        </Box>
    );
};

export default ManageCommunities;
