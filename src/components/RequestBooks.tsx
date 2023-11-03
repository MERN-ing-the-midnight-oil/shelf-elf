// src/components/RequestBooks.tsx
import React from 'react';
import MyRequestedBooks from './MyRequestedBooks';
import AvailableBooks from './AvailableBooks';

const RequestBooks: React.FC<{ token: string }> = ({ token }) => {
    return (
        <div>
            {/* Display the user's requested books */}
            <MyRequestedBooks token={token} />
            {/* Display available books to request, with a background */}
            <div style={{ backgroundColor: '#e8f0fe', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
                <AvailableBooks />
            </div>
        </div>
    );
}

export default RequestBooks;
