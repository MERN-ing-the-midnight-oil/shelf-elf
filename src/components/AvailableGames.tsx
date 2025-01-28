import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    CardActions,
    Button,
} from '@mui/material';
import { Game, SharedComponentProps } from '../types'; // Ensure correct path to types

const AvailableGames: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGamesFromAllCommunities = async () => {
            setIsLoading(true);
            setError(null); // Reset error state
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                const response = await fetch(`${API_URL}/api/games/gamesFromMyCommunities`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch games: ${response.statusText}`);
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error('Invalid response format: expected an array.');
                }

                console.log("Received games data:", data); // Log to inspect data structure
                setGames(data);
            } catch (err) {
                console.error('Error fetching games from communities:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGamesFromAllCommunities();
    }, [token]);

    const handleRequestGame = async (lendingLibraryGameId: string) => {
        const payload = { lendingLibraryGameId };
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await fetch(`${API_URL}/api/games/request`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(`Failed to request game: ${errorResponse.message || 'Unknown error'}`);
            }

            console.log("Game requested successfully");
            setRefetchCounter((prev) => prev + 1);
        } catch (err) {
            console.error('Error requesting game:', err);
            alert(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h5" gutterBottom>
                Your friends are offering the following games:
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            {isLoading ? (
                <CircularProgress />
            ) : (
                <Grid container justifyContent="center" spacing={2}>
                    {games.map((game) => (
                        <Grid item key={game.gameIdentification} xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{game.gameTitle}</Typography>
                                    <div className="game-thumbnail">
                                        <img src={game.thumbnailUrl} alt={`Thumbnail of ${game.gameTitle}`} />
                                    </div>
                                    <Typography>Rating: {game.bggRating}</Typography>
                                    <Typography>Offered by: {game.ownerUsername}</Typography>
                                    <Typography>Community: {game.communityName}</Typography>
                                    <Button
                                        component="a"
                                        href={game.bggLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        BoardGameGeek Link
                                    </Button>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleRequestGame(game.gameIdentification)}
                                    >
                                        Request This Game
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default AvailableGames;
