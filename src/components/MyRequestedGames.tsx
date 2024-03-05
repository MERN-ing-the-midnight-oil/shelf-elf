// MyRequestedGames.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';

interface Game {
    _id: string;
    title: string;
}

const MyRequestedGames: React.FC<{ token: string }> = ({ token }) => {
    const [requestedGames, setRequestedGames] = useState<Game[]>([]);

    useEffect(() => {
        const fetchRequestedGames = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/games/my-requested-games', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequestedGames(response.data);
            } catch (error) {
                console.error('Error fetching requested games:', error);
            }
        };

        fetchRequestedGames();
    }, [token]);

    return (
        <div>
            <Typography variant="h5">My Requested Games</Typography>
            {requestedGames.map((game) => (
                <div key={game._id}>
                    <p>{game.title}</p>
                    {/* Additional game details here */}
                </div>
            ))}
        </div>
    );
};

export default MyRequestedGames;
