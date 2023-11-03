// src/components/LendBooks.tsx
import React from 'react';
import MyLendingLibrary from './MyLendingLibrary';
import LendForm from './LendForm';

const LendBooks: React.FC<{ token: string, setRefetchCounter: (value: React.SetStateAction<number>) => void, refetchCounter: number }> = ({ token, setRefetchCounter, refetchCounter }) => {
    return (
        <div>
            {/* Display user's lending library */}
            <MyLendingLibrary token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
            {/* Form to add titles to the lending library */}
            <LendForm token={token} setRefetchCounter={setRefetchCounter} />
        </div>
    );
}

export default LendBooks;
