import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, List, ListItem, Divider } from '@mui/material';

interface SharedComponentProps {
    token: string;
}

interface CommunityUsernames {
    communityName: string;
    usernames: string[];
}

const Messages: React.FC<SharedComponentProps> = ({ token }) => {
    const [communityUsernames, setCommunityUsernames] = useState<CommunityUsernames[]>([]);

    useEffect(() => {
        const fetchCommunityUsernames = async () => {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            try {
                const response = await axios.get(`${API_URL}/api/messages/community-usernames`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCommunityUsernames(response.data);
            } catch (error) {
                console.error('Error fetching community usernames:', error);
            }
        };

        fetchCommunityUsernames();
    }, [token]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {communityUsernames.map(({ communityName, usernames }) => (
                <Card key={communityName} sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <CardContent>
                        <Typography variant="h5">{communityName}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <List>
                            {usernames.map((username, index) => (
                                <ListItem key={`${communityName}-${index}`}>{username}</ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default Messages;
