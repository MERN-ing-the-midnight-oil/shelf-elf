// src/components/RequestBooks.tsx
import React from 'react';
import MyRequestedBooks from './MyRequestedBooks';
import AvailableBooks from './AvailableBooks';

// RequestBooks.tsx
const RequestBooks: React.FC<{ token: string, setRefetchCounter: React.Dispatch<React.SetStateAction<number>>, refetchCounter: number }> = ({ token, setRefetchCounter, refetchCounter }) => {
    return (
        <div>
            <MyRequestedBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />
            <div style={{ backgroundColor: '#e8f0fe', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
                <AvailableBooks setRefetchCounter={setRefetchCounter} />
            </div>
        </div>
    );
}


export default RequestBooks;
