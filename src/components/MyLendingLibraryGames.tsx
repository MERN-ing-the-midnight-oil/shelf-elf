import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Paper,
    Tooltip,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

// Define types for the game and request structure
interface GameRequest {
    username: string;
    // Add other fields as necessary
}

interface Game {
    _id: string;
    game: {
        title: string;
        thumbnailUrl: string;
        bggLink: string;
    };
    isAvailable: boolean;
    requests: GameRequest[];
}

const MyLendingLibraryGames: React.FC<{
    token: string;
    refetchCounter: number;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
}> = ({ token, refetchCounter, setRefetchCounter }) => {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
                const response = await axios.get(`${API_URL}/api/games/my-library-games`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                setGames((currentGames) => currentGames.filter((game) => game._id !== gameId));
            } else {
                console.error('Failed to delete the game');
            }
        } catch (error) {
            console.error('Error deleting the game:', error);
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom textAlign="center">
                You are offering to lend the following games:
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '20%' }}>Title</TableCell>
                            <TableCell sx={{ width: '20%' }}>Availability</TableCell>
                            <TableCell sx={{ width: '15%' }}>Thumbnail</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Link</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Requested By</TableCell>
                            <TableCell align="right" sx={{ width: '10%' }}>Delete?</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {games.map((game) => (
                            <TableRow key={game._id}>
                                <TableCell>{game.game.title}</TableCell>
                                <TableCell>
                                    {game.isAvailable ? 'Available' : 'Unavailable'}
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
                                        Game Info
                                    </a>
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                    {game.requests.map((request: GameRequest) => request.username).join(', ')}
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
        </Box>
    );
};

export default MyLendingLibraryGames;
