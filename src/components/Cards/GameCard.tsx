// Assuming Game includes necessary game information and request handling requires a token

import React from 'react';
import { Button } from '@mui/material';

interface Game {
    gameId: string;
    gameTitle: string;
    bggLink: string;
    ownerUsername: string;
    communityName: string;
    bggRating: number;
}

interface GameCardProps {
    game: Game;
    token: string;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
    onRequestGame: (gameId: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, token, setRefetchCounter, onRequestGame }) => {
    const requestGame = async () => {
        onRequestGame(game.gameId);
        // Assuming onRequestGame handles the API request and state updates
    };

    return (
        <div>
            <h4>{game.gameTitle}</h4>
            <p>Rating: {game.bggRating}</p>
            <p>Offered by: {game.ownerUsername}</p>
            <p>Community: {game.communityName}</p>
            <a href={game.bggLink} target="_blank" rel="noopener noreferrer">
                {game.bggLink}
            </a>

            <Button variant="contained" color="primary" onClick={requestGame}>
                Request This Game
            </Button>
        </div>
    );
};

export default GameCard;
