import React, { useCallback } from 'react';
import MyLendingLibrary from './MyLendingLibrary';
import LendForm from './LendForm';

const LendBooks: React.FC<{ token: string, setRefetchCounter: (value: React.SetStateAction<number>) => void, refetchCounter: number }> = ({ token, setRefetchCounter, refetchCounter }) => {
    // Function to fetch the first ten games, modeled after the provided snippet
    const fetchFirstTenGames = useCallback(async () => {
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const response = await fetch(`${API_URL}/api/games/top-ten`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token if your route requires authentication
                },
            });
            if (!response.ok) {
                console.error('Server response:', response.statusText);
                return;
            }
            const data = await response.json();
            console.log(data); // Log the games to the console
        } catch (error) {
            console.error('Failed to fetch the first ten games:', error);
        }
    }, [token]);

    return (
        <div>
            {/* Display user's lending library */}
            <MyLendingLibrary token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
            {/* Form to add titles to the lending library, with a background */}
            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
                <LendForm token={token} setRefetchCounter={setRefetchCounter} />
            </div>
            {/* Button to fetch the first ten games */}
            <button onClick={fetchFirstTenGames} style={{ margin: '20px 0', padding: '10px 20px', fontSize: '16px' }}>
                Get the First Ten Games
            </button>
        </div>
    );
}

export default LendBooks;
