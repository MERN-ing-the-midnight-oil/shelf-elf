import React from 'react';
import MyLendingLibrary from './MyLendingLibrary';
import MyLendingLibraryGames from './MyLendingLibraryGames'; // Make sure to import this
import LendForm from './LendForm';
import LendFormGames from './LendFormGames';

// Ensure LendFormGamesProps and MyLendingLibraryGamesProps interfaces include setRefetchCounter if it's needed
const LendBooks: React.FC<{ token: string, setRefetchCounter: (value: React.SetStateAction<number>) => void, refetchCounter: number }> = ({ token, setRefetchCounter, refetchCounter }) => {
    return (
        <div>
            {/* Form to add book titles to the lending library */}
            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
                <LendForm token={token} setRefetchCounter={setRefetchCounter} />
            </div>
            {/* Display user's book lending library */}
            <MyLendingLibrary token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
            {/* Form to add game titles to the lending library */}
            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
                {/* Pass setRefetchCounter if LendFormGames needs it, otherwise remove it */}
                <LendFormGames token={token} setRefetchCounter={setRefetchCounter} /> {/* Update interface if needed */}
            </div>
            {/* Display user's game lending library */}
            <MyLendingLibraryGames token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
        </div>
    );
}

export default LendBooks;
