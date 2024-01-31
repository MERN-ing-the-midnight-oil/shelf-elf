// src/components/CommunityForm.tsx

import React, { useState } from 'react';
import axios from 'axios';

interface CommunityFormProps {
    token: string;
}

const CommunityForm: React.FC<CommunityFormProps> = ({ token }) => {
    const [communityName, setCommunityName] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.post('/api/communities/create', { name: communityName }, config);
            console.log(response.data);
            // Handle success (e.g., show success message, clear form)
        } catch (error) {
            console.error('Error creating community:', error);
            // Handle error (e.g., show error message)
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
            <button type="submit">Create Community</button>
        </form>
    );
}

export default CommunityForm;
