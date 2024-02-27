import React, { useState } from 'react';

// Define an interface for the component props
interface LendFormGamesProps {
    token: string;
}

const LendFormGames: React.FC<LendFormGamesProps> = ({ token }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [games, setGames] = useState<any[]>([]); // Temporary use of 'any' type for game objects

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
            setGames(data); // Assuming the API returns an array of game objects.
        } catch (error) {
            console.error('Error searching games:', error);
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
                        <button onClick={() => console.log(`Offer to lend ${game.title}`)}>Offer to Lend</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LendFormGames;
