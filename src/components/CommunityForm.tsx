import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container } from '@mui/material';
import { styled } from '@mui/system';

const FormContainer = styled(Container)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
});

interface CommunityFormProps {
    token: string;
    onRefetch: () => void; // This prop is a function to trigger refetching
}
const CommunityForm: React.FC<CommunityFormProps> = ({ token, onRefetch }) => {
    const [communityName, setCommunityName] = useState('');
    const [communityDescription, setCommunityDescription] = useState('');
    const [communityPasscode, setCommunityPasscode] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const headers = {
                'Authorization': `Bearer ${token}`
            };
            const communityData = {
                name: communityName,
                description: communityDescription,
                passcode: communityPasscode,
            };
            const response = await axios.post(`${API_URL}/api/communities/create`, communityData, { headers });
            console.log('Community created successfully:', response.data);

            onRefetch(); // This should already be in place based on your description
            console.log('Community created and refetch triggered.');

            // Reset form fields after successful submission
            setCommunityName('');
            setCommunityDescription('');
            setCommunityPasscode('');

            // Optionally, handle success UI feedback to the user here
        } catch (error) {
            console.error('Error creating community:', error);
            // Optionally, handle error UI feedback to the user here
        }
    }

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    margin="normal"
                    name="communityName"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    label="Name your Social Group (e.g. Cora G.'s thursday night game-night)"
                    variant="outlined"
                />
                <TextField
                    fullWidth
                    margin="normal"
                    name="communityDescription"
                    value={communityDescription}
                    onChange={(e) => setCommunityDescription(e.target.value)}
                    label="Who are you? (e.g. We play Scrabble every thursday night at the Blue house on State Street)"
                    variant="outlined"
                    multiline
                    rows={4}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    name="communityPasscode"
                    value={communityPasscode}
                    onChange={(e) => setCommunityPasscode(e.target.value)}
                    label="Passcode to join (choose a simple passcode and tell your friends via text, email, stage whisper, or semaphore)"
                    variant="outlined"
                    type="password"
                />
                <Button type="submit" variant="contained" color="primary">
                    Create Social Group
                </Button>
            </form>
        </FormContainer>
    );
};

export default CommunityForm;
