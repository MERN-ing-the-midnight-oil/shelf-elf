import React, { useState } from 'react';
import MyRequestedBooks from './MyRequestedBooks';
import MyRequestedGames from './MyRequestedGames';
import AvailableBooks from './AvailableBooks';
import AvailableGames from './AvailableGames';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { SharedComponentProps } from '../types';

const RequestBooks: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    // Use 'books' or 'games' as the value to determine what to show
    const [view, setView] = useState('books');

    const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: string) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    return (
        <div>
            <ToggleButtonGroup
                color="primary"
                value={view}
                exclusive
                onChange={handleViewChange}
                aria-label="View Toggle"
                sx={{
                    '& .MuiToggleButtonGroup-grouped': {
                        padding: '10px 20px', // Increase padding
                        fontSize: '3rem', // Increase font size
                        margin: '5px', // Add some space between buttons
                        border: 0, // Optional: remove border if desired
                    }
                }}
            >
                <ToggleButton value="books" aria-label="Show Books">
                    Books
                </ToggleButton>
                <ToggleButton value="games" aria-label="Show Games">
                    Games
                </ToggleButton>
            </ToggleButtonGroup>

            {view === 'books' && (
                <>
                    <MyRequestedBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <AvailableBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </>
            )}

            {view === 'games' && (
                <>
                    <MyRequestedGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <AvailableGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </>
            )}
        </div>
    );
};

export default RequestBooks;
