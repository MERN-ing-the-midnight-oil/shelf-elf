import React, { useEffect, useState } from 'react';

interface Book {
  _id?: string;
  googleBooksId: string;
  title: string;
  author: string;
  // Add other properties as needed
}

const MyLendingLibrary: React.FC = () => {
  const [myBooks, setMyBooks] = useState<Book[]>([]);

  const fetchBooksOwnedByUser = async () => {
    try {
      const response = await fetch('http://localhost:5001/books');
      if (!response.ok) {
        console.error('Server response:', response.statusText);
        return;
      }
      const data: Book[] = await response.json();
      setMyBooks(data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  useEffect(() => {
    fetchBooksOwnedByUser();
  }, []); // Empty dependency array to run once on mount

  return (
    <div>
      <h1>My Lending Library</h1>
      {myBooks.length === 0 ? (
        <p>You don't have any books in your library yet.</p>
      ) : (
        <ul>
          {myBooks.map(book => (
            <li key={book._id || book.googleBooksId}>
              <h2>{book.title}</h2>
              <p>{book.author}</p>
              {/* Render other book details as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyLendingLibrary;
