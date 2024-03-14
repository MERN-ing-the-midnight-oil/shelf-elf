import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Snackbar, Typography, Card, CardContent, CardMedia, Grid, Button } from '@mui/material';
import { SharedComponentProps } from '../types'; // Ensure this import path is correct

const MyRequestedGames: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [requestedGames, setRequestedGames] = useState<any[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');


    useEffect(() => {
        const fetchRequestedGames = async () => {
            if (!token) return;
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            try {
                const response = await axios.get(`${API_URL}/api/games/my-requested-games`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data && response.data.length > 0) {
                    const filteredGames = response.data.filter((gameRequest: any) =>
                        ["requested", "accepted", "borrowed"].includes(gameRequest.status)
                    );
                    setRequestedGames(filteredGames);
                } else {
                    console.log('No requested games found');
                }
            } catch (error) {
                console.error('Error fetching requested games:', error);
            }
        };

        fetchRequestedGames();
    }, [token, refetchCounter]);

    const handleRescindRequest = async (requestId: string): Promise<void> => {
        console.log(`Attempting to rescind request with ID: ${requestId}`);
        try {
            const response = await axios.patch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/games/rescind-game-request/${requestId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                console.log("Game request rescinded successfully");
                setSnackbarMessage("You have cancelled a game request!");
                setSnackbarOpen(true);
                setRefetchCounter(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error rescinding game request:', error);
        }
    };



    return (
        <div>
            <Typography variant="h5">My Requested Games</Typography>
            <Grid container spacing={3}>
                {requestedGames.length > 0 ? (
                    requestedGames.map((requestedGame) => (
                        <Grid item key={requestedGame._id} xs={12} sm={6} md={4}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={requestedGame.lendingLibraryGame.game.thumbnailUrl || 'defaultThumbnail.jpg'}
                                    alt={requestedGame.lendingLibraryGame.game.title}
                                    sx={{
                                        objectFit: 'contain', // Keeps the aspect ratio and fits the image within the dimensions
                                        width: '100%', // Use 100% of the card width
                                        maxHeight: '140px', // Optional: you can set a maximum height to ensure the images are uniform
                                    }}
                                />

                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {requestedGame.lendingLibraryGame.game.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Offered by: {requestedGame.lendingLibraryGame.owner.username}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Status: {requestedGame.status}
                                    </Typography>
                                    <Button
                                        component="a"
                                        href={requestedGame.lendingLibraryGame.game.bggLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        color="primary"
                                    >
                                        View on Board Game Geek
                                    </Button>
                                    <Button size="small" color="secondary" onClick={() => handleRescindRequest(requestedGame._id)}>
                                        Cancel My Request
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1">You have not requested any games yet.</Typography>
                )}
            </Grid>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </div>
    );
};

export default MyRequestedGames;
