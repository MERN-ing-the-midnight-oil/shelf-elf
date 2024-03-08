// MyRequestedGames.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';
import { Game, SharedComponentProps } from '../types'; // Adjust the import path as necessary



const MyRequestedGames: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [requestedGames, setRequestedGames] = useState<Game[]>([]);

    useEffect(() => {
        const fetchRequestedGames = async () => {
            if (!token) return;

            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                const response = await axios.get(`${API_URL}/api/games/my-requested-games`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequestedGames(response.data);
            } catch (error) {
                console.error('Error fetching requested games:', error);
            }
        };

        fetchRequestedGames();
    }, [token, refetchCounter]); // Include refetchCounter in the dependency array
    return (
        <div>
            <Typography variant="h5">My Requested Games</Typography>
            {requestedGames.length > 0 ? (
                requestedGames.map((game) => (
                    <div key={game._id}>
                        <p>{game.gameTitle}</p>

                    </div>
                ))
            ) : (
                <Typography variant="body1">You have not requested any games yet.</Typography>
            )}
        </div>
    );
};

export default MyRequestedGames;
