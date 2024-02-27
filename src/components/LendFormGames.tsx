import React, { useState } from 'react';

interface LendFormGamesProps {
    token: string;
}

const LendFormGames: React.FC<LendFormGamesProps> = ({ token }) => {
    const [title, setTitle] = useState('');

    const handleSearch = (searchTitle: string) => {
        if (!searchTitle) return;
        const formattedTitle = searchTitle.toLowerCase().replace(/[\W_]+/g, ""); // Normalize input
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
        fetch(`${API_URL}/api/games/search?title=${formattedTitle}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Search results:', data);
                // For now, just log the first closely matching game
                if (data.length > 0) {
                    const game = data.find((game: any) => game.title.toLowerCase().replace(/[\W_]+/g, "") === formattedTitle);
                    if (game) {
                        console.log('Close match found:', game);
                    } else {
                        console.log('No close matches found');
                    }
                } else {
                    console.log('No matches found');
                }
            })
            .catch(error => console.error('Error searching games:', error));
    };

    return (
        <div>
            <input
                type="text"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value);
                }}
                placeholder="Search for a game title..."
                onBlur={() => handleSearch(title)} // Trigger search when user exits the input field
            />
        </div>
    );
};

export default LendFormGames;
