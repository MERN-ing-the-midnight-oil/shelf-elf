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
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
}

const CommunityForm: React.FC<CommunityFormProps> = ({ token, setRefetchCounter }) => {
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
            console.log(response.data);
            setRefetchCounter(prev => prev + 1); // Trigger re-fetch
            // Handle success
        } catch (error) {
            console.error('Error creating community:', error);
            // Handle error
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
                    label="Name your Social Group"
                    variant="outlined"
                />
                <TextField
                    fullWidth
                    margin="normal"
                    name="communityDescription"
                    value={communityDescription}
                    onChange={(e) => setCommunityDescription(e.target.value)}
                    label="Who are you? (e.g. Springfield Dungeons and Dragons) Where and when do you meet? (e.g. 'John's house, about once per month') "
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
                    label="Passcode to join (choose a simple passcode and Share it with the right people)"
                    variant="outlined"
                    type="password"
                />
                <Button type="submit" variant="contained" color="primary">
                    Create Social Group
                </Button>
            </form>
        </FormContainer>
    );
}

export default CommunityForm;
