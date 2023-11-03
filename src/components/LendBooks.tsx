// src/components/LendBooks.tsx
import React from 'react';
import MyLendingLibrary from './MyLendingLibrary';
import LendForm from './LendForm';

const LendBooks: React.FC<{ token: string, setRefetchCounter: (value: React.SetStateAction<number>) => void, refetchCounter: number }> = ({ token, setRefetchCounter, refetchCounter }) => {
    return (
        <div>
            {/* Display user's lending library */}
            <MyLendingLibrary token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
            {/* Form to add titles to the lending library, with a background */}
            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
                <LendForm token={token} setRefetchCounter={setRefetchCounter} />
            </div>
        </div>
    );
}

export default LendBooks;
