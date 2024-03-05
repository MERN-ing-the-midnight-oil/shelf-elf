import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Game } from '../types';
import { Button } from '@mui/material';

interface AvailableTableGamesProps {
    games: Game[];
    token: string; // Add token to the props if not globally available
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>; // To trigger a refresh in parent component
}

const AvailableTableGames: React.FC<AvailableTableGamesProps> = ({ games, token, setRefetchCounter }) => {
    const handleRequestGame = async (gameId: string) => {
        try {
            const response = await fetch(`http://localhost:5001/api/games/request/${gameId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Use token for authorization
                },
            });
            if (response.ok) {
                console.log("Game requested successfully");
                setRefetchCounter(prev => prev + 1); // Optionally refresh parent component to reflect changes
            } else {
                throw new Error('Failed to request game');
            }
        } catch (error) {
            console.error('Error requesting game:', error);
        }
    };

    return (
        <Carousel showArrows={true} autoPlay={true} infiniteLoop={true}>
            {games.map((game) => (
                <div key={game.gameId}>
                    <p className="legend">{game.gameTitle}</p>
                    <p>Offered by: {game.ownerUsername}</p>
                    <p>Community: {game.communityName}</p>
                    <p>Rating: {game.bggRating}</p>
                    <a href={game.bggLink} target="_blank" rel="noopener noreferrer">BoardGameGeek Link</a>
                    {/* Add a button for requesting the game */}
                    <Button variant="contained" color="primary" onClick={() => handleRequestGame(game.gameId)}>
                        Request This Game
                    </Button>
                </div>
            ))}
        </Carousel>
    );
};

export default AvailableTableGames;
