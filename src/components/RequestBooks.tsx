import React, { useState } from 'react';
import MyRequestedBooks from './MyRequestedBooks';
import MyRequestedGames from './MyRequestedGames';
import AvailableBooks from './AvailableBooks';
import AvailableGames from './AvailableGames';
import BooksGamesToggle from './BooksGamesToggle';
import { SharedComponentProps } from '../types';

const RequestBooks: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [view, setView] = useState<'books' | 'games'>('books');

    return (
        <div>
            <BooksGamesToggle initialView={view} onViewChange={setView} />
            {view === 'books' ? (
                <>
                    <MyRequestedBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <AvailableBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </>
            ) : (
                <>
                    <MyRequestedGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                    <AvailableGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
                </>
            )}
        </div>
    );
};

export default RequestBooks;
