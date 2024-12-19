import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Tooltip } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface GameDetail {
    _id: string;
    bggLink: string;
    title: string;
    thumbnailUrl: string;
}

interface Message {
    sender: string;
    messageText: string;
    createdAt: Date;
}

interface Game {
    _id: string; // ID of the LendingLibraryGame document
    game: GameDetail;
    requests: Request[]; // This should be an array of Request objects
    messages?: Message[];
    isAvailable: boolean;
}
interface Request {
    _id: string;
    username: string; // Ensure this is included to match the data structure
}

interface MyLendingLibraryGamesProps {
    token: string;
    refetchCounter: number;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
}


const MyLendingLibraryGames: React.FC<MyLendingLibraryGamesProps> = ({ token, refetchCounter }) => {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                const response = await axios.get(`${API_URL}/api/games/my-library-games`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(response.data); // Correctly logs the fetched data
                setGames(response.data);
            } catch (error) {
                console.error('Failed to fetch games:', error);
            }
        };


        fetchGames();

    }, [refetchCounter, token]);

    const handleDelete = async (gameId: string) => {
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await axios.delete(`${API_URL}/api/games/remove-game/${gameId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                // Remove the game from the state to update the UI
                setGames(currentGames => currentGames.filter(game => game._id !== gameId));
            } else {
                console.error('Failed to delete the game');
                // Handle unsuccessful deletion, possibly show an error message to the user
            }
        } catch (error) {
            console.error('Error deleting the game:', error);
            // Handle errors, possibly show an error message to the user
        }
    };

    const handleMarkUnavailable = async (gameId: string) => {
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            console.log(`Sending request to mark game as unavailable: ${API_URL}/api/games/mark-unavailable/${gameId}`);

            const response = await axios.patch(`${API_URL}/api/games/mark-unavailable/${gameId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                console.log("Successfully marked game as unavailable: ", response.data);
                // Update the game's availability in your component's state to reflect the change
                setGames(currentGames => currentGames.map(game => {
                    if (game._id === gameId) {
                        return { ...game, isAvailable: false }; // Set isAvailable to false
                    }
                    return game;
                }));
            } else {
                console.log(`Received unexpected status code: ${response.status}`);
                // Handle unexpected status codes
            }
        } catch (error) {
            console.error('Error marking the game as unavailable:', error);
            // Handle errors, possibly by displaying a notification to the user
        }
    };


    const handleMarkAvailable = async (gameId: string) => {
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await axios.patch(`${API_URL}/api/games/mark-available/${gameId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                // Successfully marked the game as available
                // Update the game's availability in your component's state to reflect the change
                setGames(currentGames => currentGames.map(game => {
                    if (game._id === gameId) {
                        return { ...game, isAvailable: true };
                    }
                    return game;
                }));
                console.log("Game marked as available successfully", response.data);
            } else {
                // Handle unsuccessful marking as available, e.g., display an error message
                console.error('Failed to mark the game as available');
            }
        } catch (error) {
            console.error('Error marking the game as available:', error);
            // Handle error, e.g., display an error message
        }
    };

    return (
        <div>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                        fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }, // Adjust font size
                        fontWeight: 'bold',
                        color: '#333',
                        wordWrap: 'break-word',
                    }}
                >
                    You are offering to lend the following games:
                </Typography>
            </Box>
            <TableContainer
                component={Paper}
                sx={{
                    overflowX: 'auto', // Enable horizontal scrolling
                    maxWidth: '100%',
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Availability</TableCell>
                            <TableCell>Thumbnail</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Link</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Requested By</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Messages</TableCell>
                            <TableCell align="right">Delete?</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {games.map((game) => (
                            <TableRow key={game._id}>
                                <TableCell>{game.game.title}</TableCell>
                                <TableCell>
                                    {game.isAvailable ? 'Available' : 'Unavailable'}
                                    {game.isAvailable ? (
                                        <Button
                                            onClick={() => handleMarkUnavailable(game._id)}
                                            color="secondary"
                                            size="small"
                                            variant="outlined"
                                            sx={{ ml: 1 }}
                                        >
                                            Mark as "Unavailable"
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleMarkAvailable(game._id)}
                                            color="primary"
                                            size="small"
                                            variant="outlined"
                                            sx={{ ml: 1 }}
                                        >
                                            Mark as "Available"
                                        </Button>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <img
                                        src={game.game.thumbnailUrl}
                                        alt={`${game.game.title} thumbnail`}
                                        style={{ width: '60px', height: 'auto' }}
                                    />
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                    <a href={game.game.bggLink} target="_blank" rel="noopener noreferrer">
                                        Game Information
                                    </a>
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                    {game.requests.map((request) => request.username).join(', ')}
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                    {game.messages?.map((msg, index) => (
                                        <div key={index}>{`${msg.sender}: ${msg.messageText}`}</div>
                                    ))}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Delete Forever">
                                        <IconButton onClick={() => handleDelete(game._id)} color="error">
                                            <DeleteForeverIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </div>
    );


};

export default MyLendingLibraryGames;
