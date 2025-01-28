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
    CircularProgress,
    Alert,
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchCommunities = async () => {
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
                console.log("Fetching communities from:", `${API_URL}/api/communities/list`);
                const response = await axios.get<Community[]>(`${API_URL}/api/communities/list`);

                if (isMounted) {
                    if (Array.isArray(response.data)) {
                        console.log("Communities fetched successfully:", response.data);
                        setCommunities(response.data);
                    } else {
                        throw new Error("Invalid response format");
                    }
                }
            } catch (err) {
                console.error("Error fetching communities:", err);
                if (isMounted) {
                    setError("Failed to fetch communities.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCommunities();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const handleJoinCommunity = async (communityId: string, passcode: string) => {
        try {
            await onCommunityJoin(communityId, passcode);
            setError(null);
        } catch (err) {
            console.error("Error joining community:", err);
            setError("Incorrect passcode or unable to join the group. Please try again.");
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
                Join an Existing Lending Group:
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
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
                                    const passcode = (formData.get("joinCode") as string) || "";
                                    handleJoinCommunity(community._id, passcode);
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
                <Typography>No Lending Groups available to join.</Typography>
            )}
        </Box>
    );
};

export default ExistingCommunities;
