import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, CircularProgress, Container, Link } from '@mui/material';
import { styled } from '@mui/system';
import { Game } from '../types';
import { SharedComponentProps } from '../types';



const ContainerStyled = styled(Container)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
});

const GameItem = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    width: '100%',
    margin: '10px 0',
    borderBottom: '1px solid #ccc',
    paddingBottom: '10px',
});

const LendFormGames: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm) {
                handleSearch(searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const handleSearch = async (title: string) => {
        setIsLoading(true);
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        try {
            const response = await fetch(`${API_URL}/api/games/search?title=${title}`, {
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

    const offerToLend = async (game: Game) => {
        console.log("Offering to lend game:", game); // Add this line to log the game object

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            //figure out why the game incorrectly has property "_id" instead of "gameId"
            body: JSON.stringify({ gameId: game._id }), // Ensure correct ID is sent
        };

        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await fetch(`${API_URL}/api/games/lend`, requestOptions);

            if (response.ok) {
                setRefetchCounter(prev => prev + 1);
                setGames([]);
            } else if (response.status === 400) {
                const errorMessage = await response.json();
                alert(errorMessage.message);
            } else {
                throw new Error('Network response was not ok');
            }
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
                placeholder="Type a game title"
                margin="normal"
            />
            {isLoading && <CircularProgress />}
            {games.map((game) => (
                <GameItem key={game._id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    {game.thumbnailUrl && (
                        <img src={game.thumbnailUrl} alt={game.gameTitle} style={{ maxWidth: '100%', marginBottom: '10px' }} />
                    )}
                    {/* Include "The game title is: " before the game title */}
                    <Typography variant="h6" component="p" style={{ marginBottom: '10px' }}>
                        {game.title}
                    </Typography>
                    <Link href={game.bggLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '10px' }}>
                        View on BoardGameGeek
                    </Link>
                    <Button variant="contained" color="primary" onClick={() => offerToLend(game)}>
                        Offer to Lend
                    </Button>
                </GameItem>
            ))}


        </ContainerStyled>
    );
};

export default LendFormGames;
