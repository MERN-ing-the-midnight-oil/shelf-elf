// MyRequestedGames.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Card, CardContent, CardMedia } from '@mui/material';
import { SharedComponentProps } from '../types'; // Ensure this import path is correct

const MyRequestedGames: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [requestedGames, setRequestedGames] = useState<any[]>([]); // Using any[] for simplicity, consider defining a specific interface

    useEffect(() => {
        const fetchRequestedGames = async () => {
            if (!token) return;
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

            try {
                const response = await axios.get(`${API_URL}/api/games/my-requested-games`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data && response.data.length > 0) {
                    setRequestedGames(response.data);
                } else {
                    console.log('No requested games found');
                }
            } catch (error) {
                console.error('Error fetching requested games:', error);
            }
        };

        fetchRequestedGames();
    }, [token, setRefetchCounter, refetchCounter]);


    return (
        <div>
            <Typography variant="h5">My Requested Games</Typography>
            {requestedGames.length > 0 ? (
                requestedGames.map((requestedGame) => (
                    // Adjust access to nested 'game' property
                    requestedGame.lendingLibraryGame && requestedGame.lendingLibraryGame.game ? (
                        <div key={requestedGame._id} style={{ marginBottom: '20px' }}>
                            <img src={requestedGame.lendingLibraryGame.game.thumbnailUrl || 'defaultThumbnailUrl.jpg'} alt={requestedGame.lendingLibraryGame.game.title || 'Default Title'} style={{ width: '100px', height: 'auto' }} />
                            <div>
                                <Typography variant="h6">{requestedGame.lendingLibraryGame.game.title || 'Unknown Title'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Offered by: {requestedGame.lendingLibraryGame.owner.username || 'Unknown'}
                                </Typography>
                                <a href={requestedGame.lendingLibraryGame.game.bggLink || '#'} target="_blank" rel="noopener noreferrer">
                                    View on BoardGameGeek
                                </a>
                            </div>
                        </div>
                    ) : (
                        <Typography key={requestedGame._id} variant="body2" color="text.secondary">
                            Game details unavailable.
                        </Typography>
                    )
                ))
            ) : (
                <Typography variant="body1">You have not requested any games yet.</Typography>
            )}
        </div>
    );


};

export default MyRequestedGames;
