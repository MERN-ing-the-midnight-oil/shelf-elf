import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Container } from '@mui/material';
import AvailableTableGames from './AvailableTableGames'; // Assuming you've created this component
import { Game } from '../types'; // Adjust the import path as necessary
import { SharedComponentProps } from '../types'; // Adjust the import path as necessary



const AvailableGames: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {

    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchGamesFromAllCommunities = async () => {
            setIsLoading(true);
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                // Use the token passed via props, not from localStorage
                const response = await fetch(`${API_URL}/api/games/gamesFromMyCommunities`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setGames(data);
            } catch (error) {
                console.error('Error fetching games from communities:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGamesFromAllCommunities();
    }, [token]); // Depend on the token prop to refetch when it changes

    return (
        <Container maxWidth="md">
            <Typography variant="h5" gutterBottom>
                Games available in your communities:
            </Typography>
            {isLoading ? (
                <CircularProgress />
            ) : (
                // Pass all required props to AvailableTableGames
                <AvailableTableGames games={games} token={token} setRefetchCounter={setRefetchCounter} />
            )}
        </Container>
    );
};

export default AvailableGames;
