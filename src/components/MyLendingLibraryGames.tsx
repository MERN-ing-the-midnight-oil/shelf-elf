import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Tooltip } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface Game {
    _id: string;
    title: string;
    bggLink: string;
    bggRating: number;
    status: string;
}

interface MyLendingLibraryGamesProps {
    token: string;
    refetchCounter: number;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
}

const MyLendingLibraryGames: React.FC<MyLendingLibraryGamesProps> = ({ token, refetchCounter, setRefetchCounter }) => {
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
                setGames(response.data);
            } catch (error) {
                console.error('Failed to fetch games:', error);
            }
        };

        fetchGames();
    }, [refetchCounter, token]);

    const handleMarkAsUnavailable = async (id: string) => {
        // Implementation for marking a game as unavailable
    };

    const handleDeleteForever = async (gameId: string) => {
        if (!token) {
            console.error('Token not provided.');
            return;
        }

        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await fetch(`${API_URL}/api/games/remove-game/${gameId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('Game removed from lending library successfully.');
                // Trigger re-fetch or state update to reflect the changes in the UI
                // If you're using a state to store the games, you might want to filter out the deleted game
                // For example, if you have a state variable named 'games', you could do something like this:
                setGames(prevGames => prevGames.filter(game => game._id !== gameId));
            } else {
                // Handle potential errors - for example, game not found, or user not authorized to delete the game
                const errorResponse = await response.json();
                console.error('Failed to delete game permanently:', errorResponse.message);
                alert(errorResponse.message); // Optionally alert the user about the error
            }
        } catch (error) {
            console.error('Failed to delete game permanently:', error);
        }
    };


    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {games.map((game) => (
                        <TableRow key={game._id}>
                            <TableCell>{game.title}</TableCell>
                            <TableCell>{game.bggRating}</TableCell>
                            <TableCell>{game.status}</TableCell>
                            <TableCell align="right">
                                <Tooltip title="Mark as Unavailable">
                                    <span>
                                        <IconButton onClick={() => handleMarkAsUnavailable(game._id)} color="warning" disabled={game.status === 'unavailable'}>
                                            <BlockIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Delete Forever">
                                    <IconButton onClick={() => handleDeleteForever(game._id)} color="error">
                                        <DeleteForeverIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default MyLendingLibraryGames;
