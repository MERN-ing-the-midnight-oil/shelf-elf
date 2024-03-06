import React, { useState } from 'react';
import MyRequestedBooks from './MyRequestedBooks';
import MyRequestedGames from './MyRequestedGames';
import AvailableBooks from './AvailableBooks';
import AvailableGames from './AvailableGames';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// Assuming SharedComponentProps is properly imported
import { SharedComponentProps } from '../types';

const RequestBooks: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    // Use 'books' or 'games' as the value to determine what to show
    const [view, setView] = useState('books');

    const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: string) => {
        // Prevent the view from being cleared on click
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
                <>     <MyRequestedGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />

                    <AvailableGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </>)}
        </div>
    );
};

export default RequestBooks;
