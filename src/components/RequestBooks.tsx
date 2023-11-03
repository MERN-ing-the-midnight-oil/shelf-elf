// src/components/RequestBooks.tsx
import React from 'react';
import MyRequestedBooks from './MyRequestedBooks';
import AvailableBooks from './AvailableBooks';

const RequestBooks: React.FC<{ token: string }> = ({ token }) => {
    return (
        <div>
            {/* Display the user's requested books */}
            <MyRequestedBooks token={token} />
            {/* Display available books to request */}
            <AvailableBooks />
        </div>
    );
}

export default RequestBooks;
