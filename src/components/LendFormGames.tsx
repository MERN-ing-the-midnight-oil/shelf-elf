import React, { useState } from 'react';

// Define an interface for the component props
interface LendFormGamesProps {
    token: string;
}

const LendFormGames: React.FC<LendFormGamesProps> = ({ token }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [games, setGames] = useState<any[]>([]);

    const handleSearch = async (title: string) => {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        };

        try {
            const response = await fetch(`http://localhost:5001/api/games/search?title=${title}`, requestOptions);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setGames(data);
        } catch (error) {
            console.error('Error searching games:', error);
        }
    };

    const offerToLend = async (game: any) => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ game }),
        };
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await fetch(`${API_URL}/api/games/lend`, requestOptions);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const updatedGames = await response.json();
            console.log('Updated lendingLibraryGames:', updatedGames);
        } catch (error) {
            console.error('Error offering game to lend:', error);
        }
    };

    const handleBlur = () => {
        handleSearch(searchTerm);
    };

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={handleBlur}
                placeholder="Search for a game title"
            />
            <div>
                {games.map((game) => (
                    <div key={game._id} style={{ marginBottom: '10px' }}>
                        <span>{game.title}</span>
                        <button onClick={() => offerToLend(game)}>Offer to Lend</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LendFormGames;
