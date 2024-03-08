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
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    const [joinPasscodes, setJoinPasscodes] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

        // Fetch all communities
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

        // Fetch user's communities
        const fetchUserCommunities = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/communities/user-communities`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserCommunities(response.data);
            } catch (error) {
                console.error('Error fetching user communities:', error);
            }
        };

        fetchAllCommunities();
        fetchUserCommunities();
    }, [token, refetchCounter]);


    const handleJoinCommunity = async (communityId: string) => {
        try {
            const passcode = joinPasscodes[communityId];
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await axios.post(`${API_URL}/api/communities/join`, {
                communityId,
                passcode,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data);
            setRefetchCounter(prev => prev + 1); // Update refetchCounter to trigger a re-fetch
            // Handle success (e.g., update UI to reflect the new community membership)
        } catch (error) {
            console.error('Error joining community:', error);
            // Handle error (e.g., show error message)
        }
    };


    const updatePasscode = (communityId: string, passcode: string) => {
        setJoinPasscodes(prev => ({ ...prev, [communityId]: passcode }));
    };

    return (
        <div>
            <h1>Manage Social Groups</h1>
            <CommunityForm token={token} setRefetchCounter={setRefetchCounter} />

            <h2>Your Social Groups</h2>
            {userCommunities.length > 0 ? (
                <ul>
                    {userCommunities.map((community) => (
                        <li key={community._id}>{community.name} - {community.description}</li>
                    ))}
                </ul>
            ) : (
                <p>You are not part of any social groups yet.</p>
            )}

            <h2>Find and join an existing Social Group if you have a passcode</h2>
            {communities.map(community => (
                <div key={community._id}>
                    <p>{community.name} - {community.description}</p>
                    <input
                        type="password"
                        placeholder="Enter passcode"
                        value={joinPasscodes[community._id] || ''}
                        onChange={(e) => updatePasscode(community._id, e.target.value)}
                    />
                    <button onClick={() => handleJoinCommunity(community._id)}>Join</button>
                </div>
            ))}
        </div>
    );
};

export default ManageCommunities;
