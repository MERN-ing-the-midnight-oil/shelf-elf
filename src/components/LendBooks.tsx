import React, { useState } from 'react';
import MyLendingLibrary from './MyLendingLibrary';
import MyLendingLibraryGames from './MyLendingLibraryGames';
import LendForm from './LendForm';
import LendFormGames from './LendFormGames';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';


import { SharedComponentProps } from '../types';

const LendBooks: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [view, setView] = useState('books');


    const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: string) => {
        if (newView !== null) {
            setView(newView);
        }
    };


    return (
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            {/* View Toggle */}
            <ToggleButtonGroup
                color="primary"
                value={view}
                exclusive
                onChange={handleViewChange}
                aria-label="View Toggle"
                sx={{
                    '& .MuiToggleButtonGroup-grouped': {
                        padding: { xs: '8px 16px', sm: '10px 20px' }, // Smaller padding on mobile
                        fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' }, // Responsive font size
                        margin: '5px',
                        border: 0,
                        textTransform: 'none', // Ensure readable case
                    },
                    justifyContent: 'center',
                    display: 'flex',
                    flexWrap: 'wrap', // Wrap buttons on small screens
                }}
            >
                <ToggleButton value="books" aria-label="Show Books">
                    Show Books
                </ToggleButton>
                <ToggleButton value="games" aria-label="Show Games">
                    Show Games
                </ToggleButton>
            </ToggleButtonGroup>

            {/* Conditionally Render Based on View */}
            {view === 'books' && (
                <Box sx={{ mt: 2 }}>
                    <LendForm token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <MyLendingLibrary token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </Box>
            )}
            {view === 'games' && (
                <Box sx={{ mt: 2 }}>
                    <LendFormGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <MyLendingLibraryGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </Box>
            )}
        </Box>
    );
};

export default LendBooks;
