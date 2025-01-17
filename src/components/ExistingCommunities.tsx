import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Community {
    _id: string;
    name: string;
    description: string;
}

interface ExistingCommunitiesProps {
    token: string;
    onCommunityJoin: (communityId: string, passcode: string) => Promise<void>;
}


const ExistingCommunities: React.FC<ExistingCommunitiesProps> = ({ token }) => {
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
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h3>Existing Communities</h3>
            <ul>
                {communities.map((community) => (
                    <li key={community._id}>{community.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default ExistingCommunities;
