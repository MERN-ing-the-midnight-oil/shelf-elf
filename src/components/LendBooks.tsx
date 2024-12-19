import React, { useState } from 'react';
import MyLendingLibrary from './MyLendingLibrary';
import MyLendingLibraryGames from './MyLendingLibraryGames';
import LendForm from './LendForm';
import LendFormGames from './LendFormGames';
import BooksGamesToggle from './BooksGamesToggle';
import { Box } from '@mui/material';
import { SharedComponentProps } from '../types';

const LendBooks: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [view, setView] = useState<'books' | 'games'>('books');

    return (
        <Box>
            <BooksGamesToggle initialView={view} onViewChange={setView} />
            {view === 'books' ? (
                <Box sx={{ mt: 2 }}>
                    <LendForm token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <MyLendingLibrary token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </Box>
            ) : (
                <Box sx={{ mt: 2 }}>
                    <LendFormGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <MyLendingLibraryGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </Box>
            )}
        </Box>
    );
};

export default LendBooks;
