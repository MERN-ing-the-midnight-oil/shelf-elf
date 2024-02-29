import React, { useState } from 'react';
import { TextField, Button, Typography, CircularProgress, Container } from '@mui/material';
import { styled } from '@mui/system';

interface LendFormGamesProps {
    token: string;
}

const ContainerStyled = styled(Container)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
});

const GameItem = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    margin: '10px 0',
});

const LendFormGames: React.FC<LendFormGamesProps> = ({ token }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [games, setGames] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (title: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/games/search?title=${title}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            setGames(data);
        } catch (error) {
            console.error('Error searching games:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const offerToLend = async (game: any) => {
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await fetch(`${API_URL}/api/games/lend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ gameId: game._id }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const updatedGames = await response.json();
            console.log('Updated lendingLibraryGames:', updatedGames);
        } catch (error) {
            console.error('Error offering game to lend:', error);
        }
    };

    return (
        <ContainerStyled maxWidth="sm">
            <Typography variant="h5" gutterBottom>
                Add board game titles to your games lending shelf:
            </Typography>
            <TextField
                fullWidth
                label="Game Title"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => handleSearch(searchTerm)}
                placeholder="Type a game title"
                margin="normal"
            />
            {isLoading && <CircularProgress />}
            {games.map((game) => (
                <GameItem key={game._id}>
                    <Typography>{game.title}</Typography>
                    <Button variant="contained" color="primary" onClick={() => offerToLend(game)}>
                        Offer to Lend
                    </Button>
                </GameItem>
            ))}
        </ContainerStyled>
    );
};

export default LendFormGames;
