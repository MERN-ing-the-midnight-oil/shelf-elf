import React, { useState } from 'react';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';

interface BooksGamesToggleProps {
    initialView?: 'books' | 'games';
    onViewChange: (view: 'books' | 'games') => void;
}

const BooksGamesToggle: React.FC<BooksGamesToggleProps> = ({ initialView = 'books', onViewChange }) => {
    const [view, setView] = useState<'books' | 'games'>(initialView);

    const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: 'books' | 'games' | null) => {
        if (newView !== null) {
            setView(newView);
            onViewChange(newView);
        }
    };

    return (
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <ToggleButtonGroup
                color="primary"
                value={view}
                exclusive
                onChange={handleViewChange}
                aria-label="View Toggle"
                sx={{
                    '& .MuiToggleButtonGroup-grouped': {
                        padding: { xs: '8px 16px', sm: '10px 20px' },
                        fontSize: { xs: '1rem', sm: '1.5rem' },
                        margin: '5px',
                        border: 0,
                        textTransform: 'none',
                    },
                    justifyContent: 'center',
                    display: 'flex',
                    flexWrap: 'wrap',
                }}
            >
                <ToggleButton value="books" aria-label="Books">
                    Books
                </ToggleButton>
                <ToggleButton value="games" aria-label="Games">
                    Games
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

export default BooksGamesToggle;
