import React, { useState } from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';
import axios from 'axios';

interface CreateNewCommunityProps {
    token: string;
    onCommunityCreated: () => void; // Callback to refresh communities after creation
}

const CreateNewCommunity: React.FC<CreateNewCommunityProps> = ({ token, onCommunityCreated }) => {
    const [newCommunityName, setNewCommunityName] = useState('');
    const [newCommunityDescription, setNewCommunityDescription] = useState('');
    const [newCommunityPasscode, setNewCommunityPasscode] = useState('');

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

    const handleCreateCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API_URL}/api/communities/create`,
                {
                    name: newCommunityName,
                    description: newCommunityDescription,
                    passcode: newCommunityPasscode,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Community created successfully.');
            setNewCommunityName('');
            setNewCommunityDescription('');
            setNewCommunityPasscode('');
            onCommunityCreated(); // Refresh communities after creation
        } catch (error) {
            console.error('Error creating community:', error);
            alert('Failed to create the community.');
        }
    };

    return (
        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Create a New Lending Group:
            </Typography>
            <form onSubmit={handleCreateCommunity}>
                <TextField
                    label="Group Name"
                    value={newCommunityName}
                    onChange={(e) => setNewCommunityName(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Description"
                    value={newCommunityDescription}
                    onChange={(e) => setNewCommunityDescription(e.target.value)}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={2}
                />
                <TextField
                    label="Passcode"
                    type="password"
                    value={newCommunityPasscode}
                    onChange={(e) => setNewCommunityPasscode(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <Button type="submit" variant="contained" fullWidth>
                    Create
                </Button>
            </form>
        </Box>
    );
};

export default CreateNewCommunity;
