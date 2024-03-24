import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Tooltip } from '@mui/material';
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
            <h1>You are offering to lend the following games:</h1>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Availability</TableCell>
                            <TableCell>Thumbnail</TableCell>
                            <TableCell>Link</TableCell>
                            <TableCell>Requested By</TableCell>
                            <TableCell>Messages</TableCell>
                            <TableCell align="right">Delete?</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {games.map((game) => (
                            <TableRow key={game._id}>
                                <TableCell>{game.game.title}</TableCell>
                                <TableCell>
                                    {game.isAvailable ? "Available" : "Unavailable"}
                                    {game.isAvailable ? (
                                        <Button onClick={() => handleMarkUnavailable(game._id)} color="secondary" size="small" variant="outlined" style={{ marginLeft: '10px' }}>
                                            Mark as "Unavailable"
                                        </Button>
                                    ) : (
                                        <Button onClick={() => handleMarkAvailable(game._id)} color="primary" size="small" variant="outlined" style={{ marginLeft: '10px' }}>
                                            Mark as "Available"
                                        </Button>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <img src={game.game.thumbnailUrl} alt={`${game.game.title} thumbnail`} style={{ width: '100px' }} />
                                </TableCell>
                                <TableCell>
                                    <a href={game.game.bggLink} target="_blank" rel="noopener noreferrer">Game Information</a>
                                </TableCell>
                                <TableCell>
                                    {game.requests.map(request => request.username).join(', ')}
                                </TableCell>

                                <TableCell>
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
