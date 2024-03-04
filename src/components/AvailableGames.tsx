import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Container } from '@mui/material';
import AvailableTableGames from './AvailableTableGames'; // Assuming you've created this component
import { Game } from '../types'; // Adjust the import path as necessary


const AvailableGames: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchGamesFromAllCommunities = async () => {
            setIsLoading(true);
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                const token = localStorage.getItem('userToken');
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
    }, []);

    return (
        <Container maxWidth="md">
            <Typography variant="h5" gutterBottom>
                Games available in your communities:
            </Typography>
            {isLoading ? (
                <CircularProgress />
            ) : (
                <AvailableTableGames games={games} />
            )}
        </Container>
    );
};

export default AvailableGames;
