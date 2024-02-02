import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommunityForm from './CommunityForm';

interface Community {
    _id: string;
    name: string;
    description: string;
    members: string[];
}

interface ManageCommunitiesProps {
    token: string;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
    refetchCounter: number;
}

const ManageCommunities: React.FC<ManageCommunitiesProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [communities, setCommunities] = useState<Community[]>([]);

    useEffect(() => {
        const fetchCommunities = async () => {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/api/users/my-communities`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setCommunities(response.data);
                } catch (error) {
                    console.error('Error fetching communities:', error);
                }
            }
        };


        fetchCommunities();
    }, [token, refetchCounter]); // Refetch when token or refetchCounter changes

    return (
        <div>
            <h1>Manage Communities</h1>
            <CommunityForm token={token} setRefetchCounter={setRefetchCounter} />

            <h2>Your Communities</h2>
            {communities.length > 0 ? (
                <ul>
                    {communities.map((community) => (
                        <li key={community._id}>
                            {community.name} - {community.description}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You are not part of any communities yet.</p>
            )}
        </div>
    );
}

export default ManageCommunities;
