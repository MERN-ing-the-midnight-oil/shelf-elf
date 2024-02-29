import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Game {
    _id: string;
    title: string;
    bggLink: string;
    bggRating: number;
}

interface MyLendingLibraryGamesProps {
    token: string;
    refetchCounter: number;
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
                setGames(response.data);
            } catch (error) {
                console.error('Failed to fetch games:', error);
            }
        };

        fetchGames();
    }, [refetchCounter, token]);

    return (
        <div>
            <h2>You are offering to lend the following games:</h2>
            <div>
                {games.map((game) => (
                    <div key={game._id}>
                        <p>{game.title}</p>
                        <a href={game.bggLink} target="_blank" rel="noopener noreferrer">View on BoardGameGeek</a>
                        <p>Rating: {game.bggRating}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyLendingLibraryGames;
