import React from 'react';
import { Game } from '../types';



interface AvailableTableGamesProps {
    games: Game[];
}

const AvailableTableGames: React.FC<AvailableTableGamesProps> = ({ games }) => {
    return (
        <div>
            {games.length > 0 ? (
                games.map((game) => (
                    <div key={game._id} style={{ marginBottom: "10px" }}>
                        <h4>{game.title}</h4>
                        <p><a href={game.bggLink} target="_blank" rel="noopener noreferrer">
                            BoardGameGeek Link
                        </a></p>
                        <p>Offered by: {game.ownerUsername}</p>
                        <p>Community: {game.communityName}</p>
                    </div>
                ))
            ) : (
                <p>No games available from your communities at the moment.</p>
            )}
        </div>
    );
};

export default AvailableTableGames;
