// src/components/ExistingCommunities.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Community {
    _id: string;
    name: string;
    description: string;
}

interface ExistingCommunitiesProps {
    token: string;
    onCommunityJoin: (communityId: string, passcode: string) => void;
}

const ExistingCommunities: React.FC<ExistingCommunitiesProps> = ({ token, onCommunityJoin }) => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

    useEffect(() => {
        const fetchAllCommunities = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/communities/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCommunities(response.data);
            } catch (error) {
                console.error('Error fetching communities:', error);
            }
        };
        fetchAllCommunities();
    }, [token, API_URL]);

    return (
        <div style={{ marginTop: '1rem' }}>
            <Typography variant="h5" gutterBottom>
                Join an Existing Social Group:
            </Typography>
            {communities.map((community) => (
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
            ))}
        </div>
    );
};

export default ExistingCommunities;
