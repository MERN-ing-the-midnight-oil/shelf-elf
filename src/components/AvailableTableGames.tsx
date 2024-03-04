import React from 'react';

interface Game {
    _id: string;
    title: string;
    bggLink: string;
    bggRating: number;
}

interface AvailableTableGamesProps {
    games: Game[];
}

const AvailableTableGames: React.FC<AvailableTableGamesProps> = ({ games }) => {
    return (
        <div>
            {games.map((game) => (
                <div key={game._id}>
                    <p>{game.title}</p>
                    <a href={game.bggLink} target="_blank" rel="noopener noreferrer">
                        BoardGameGeek Link
                    </a>
                </div>
            ))}
        </div>
    );
};

export default AvailableTableGames;
