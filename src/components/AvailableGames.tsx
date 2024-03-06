import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, CircularProgress } from '@mui/material';
import GameCard from './Cards/GameCard'; // Ensure the import path is correct
import { Game, SharedComponentProps } from '../types'; // Assuming types.ts is directly under src/

const AvailableGames: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchGamesFromAllCommunities = async () => {
            setIsLoading(true);
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
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
    }, [token]);

    const handleRequestGame = async (gameId: string) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/games/request/${gameId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to request game');
            }
            console.log("Game requested successfully");
            setRefetchCounter(prev => prev + 1); // Trigger refresh
        } catch (error) {
            console.error('Error requesting game:', error);
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h5" gutterBottom>
                Browse games available in your social groups:
            </Typography>
            {isLoading ? (
                <CircularProgress />
            ) : (
                <Grid container justifyContent="center" spacing={2}>
                    {games.map((game) => (
                        <Grid item key={game.gameId} xs={12} sm={6} md={4}>
                            <GameCard
                                game={game}
                                token={token}
                                setRefetchCounter={setRefetchCounter}
                                onRequestGame={handleRequestGame} // Defined in AvailableGames or parent component
                            />
                        </Grid>
                    ))}
                </Grid>


            )}
        </Container>
    );
};

export default AvailableGames;
