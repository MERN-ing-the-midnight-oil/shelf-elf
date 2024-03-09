import React, { useState } from 'react';
import MyLendingLibrary from './MyLendingLibrary';
import MyLendingLibraryGames from './MyLendingLibraryGames';
import LendForm from './LendForm';
import LendFormGames from './LendFormGames';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// Properly import SharedComponentProps
import { SharedComponentProps } from '../types';

const LendBooks: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
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
                        padding: '10px 20px',
                        fontSize: '3rem',
                        margin: '5px',
                        border: 0,
                    }
                }}
            >
                <ToggleButton value="books" aria-label="Show Books">Books</ToggleButton>
                <ToggleButton value="games" aria-label="Show Games">Games</ToggleButton>
            </ToggleButtonGroup>

            {view === 'books' && (
                <>
                    <LendForm token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <MyLendingLibrary token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </>
            )}
            {view === 'games' && (
                <>
                    <LendFormGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <MyLendingLibraryGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </>
            )}
        </div>
    );
};

export default LendBooks;
