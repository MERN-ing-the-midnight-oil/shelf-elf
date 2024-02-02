import React, { useState } from 'react';
import axios from 'axios';

interface CommunityFormProps {
    token: string;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
}

const CommunityForm: React.FC<CommunityFormProps> = ({ token, setRefetchCounter }) => {
    const [communityName, setCommunityName] = useState('');
    const [communityDescription, setCommunityDescription] = useState(''); // Added state variable for community description

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
        <form onSubmit={handleSubmit}>
            <label htmlFor="communityName">Community Name:</label>
            <input
                type="text"
                id="communityName"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
            />

            <label htmlFor="communityDescription">Community Description:</label>
            <input
                type="text"
                id="communityDescription"
                value={communityDescription}
                onChange={(e) => setCommunityDescription(e.target.value)}
            />

            <button type="submit">Create Community</button>
        </form>
    );
}

export default CommunityForm;
