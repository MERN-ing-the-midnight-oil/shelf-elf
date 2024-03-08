// Assuming Game includes necessary game information and request handling requires a token

import React from 'react';
import { Button } from '@mui/material';
import { Game } from '../../types'; // Assuming types.ts is directly under src/



// Assuming the Game type includes ownerUsername
interface GameCardProps {
    game: Game; // Make sure the Game type includes ownerUsername
    token: string;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
    onRequestGame: (gameId: string, ownerUsername: string) => void; // Updated to accept two parameters
}
const GameCard: React.FC<GameCardProps> = ({ game, token, setRefetchCounter, onRequestGame }) => {
    const requestGame = async () => {
        // Pass both gameId and ownerUsername to the onRequestGame function
        onRequestGame(game._id, game.ownerUsername); // Adjusted to pass ownerUsername as well
    };

    return (
        <div>
            <h4>{game.gameTitle}</h4>
            <p>Rating: {game.bggRating}</p>
            <p>Offered by: {game.ownerUsername}</p>
            <p>Community: {game.communityName}</p>
            <a href={game.bggLink} target="_blank" rel="noopener noreferrer">
                BoardGameGeek Link
            </a>
            <Button variant="contained" color="primary" onClick={requestGame}>
                Request This Game
            </Button>
        </div>
    );
};


export default GameCard;
