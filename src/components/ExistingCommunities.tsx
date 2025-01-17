import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    TextField,
    Button,
    Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Community {
    _id: string;
    name: string;
    description: string;
}

interface ExistingCommunitiesProps {
    token: string;
    onCommunityJoin: (communityId: string, passcode: string) => Promise<void>;
}

const ExistingCommunities: React.FC<ExistingCommunitiesProps> = ({ token, onCommunityJoin }) => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; // A flag to track if the component is mounted

        const fetchCommunities = async () => {
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                const response = await axios.get(`${API_URL}/api/communities/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (isMounted) {
                    setCommunities(response.data);
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching communities:', error);
                    setLoading(false);
                }
            }
        };

        fetchCommunities();

        // Cleanup function to prevent state updates if the component unmounts
        return () => {
            isMounted = false;
        };
    }, [token]);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
                Join an Existing Social Group:
            </Typography>
            {communities.length > 0 ? (
                communities.map((community) => (
                    <Accordion key={community._id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{community.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>{community.description}</Typography>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const passcode = formData.get('joinCode') as string;
                                    onCommunityJoin(community._id, passcode);
                                }}
                            >
                                <TextField
                                    name="joinCode"
                                    label="Passcode"
                                    fullWidth
                                    margin="normal"
                                />
                                <Button type="submit" variant="contained" fullWidth>
                                    Join
                                </Button>
                            </form>
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Typography>No social groups available to join.</Typography>
            )}
        </Box>
    );
};

export default ExistingCommunities;
