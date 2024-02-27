// src/components/LendBooks.tsx
import React from 'react';
import MyLendingLibrary from './MyLendingLibrary';
import LendForm from './LendForm';
import LendFormGames from './LendFormGames'; // Ensure this import is correct

const LendBooks: React.FC<{ token: string, setRefetchCounter: (value: React.SetStateAction<number>) => void, refetchCounter: number }> = ({ token, setRefetchCounter, refetchCounter }) => {
    return (
        <div>
            {/* Display user's lending library */}
            <MyLendingLibrary token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
            {/* Form to add book titles to the lending library */}
            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
                <LendForm token={token} setRefetchCounter={setRefetchCounter} />
            </div>
            {/* Component to handle lending of games */}
            <LendFormGames token={token} /> {/* Removed setRefetchCounter prop */}
        </div>
    );
}

export default LendBooks;
