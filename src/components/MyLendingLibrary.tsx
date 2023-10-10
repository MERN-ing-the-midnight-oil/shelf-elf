import React, { useEffect, useState } from 'react';

const MyLendingLibrary: React.FC = () => {
  const [myBooks, setMyBooks] = useState<any[]>([]); // You should replace any with your actual Book type

  useEffect(() => {
    fetchBooksOwnedByUser();
  }, []); // The empty dependency array means this useEffect runs once when the component mounts

  const fetchBooksOwnedByUser = async () => {
    try {
      const response = await fetch('http://localhost:5001/books'); // Adjust this URL to your actual endpoint
      const books = await response.json();
      setMyBooks(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      // handle error appropriately, maybe set an error state to display a message to the user
    }
  };

  return (
    <div>
      <h1>My Lending Library</h1>
      {myBooks.length === 0 ? (
        <p>You don't have any books in your library yet.</p>
      ) : (
        <ul>
          {myBooks.map(book => (
            <li key={book.googleBooksId}>
              <h2>{book.title}</h2>
              <p>{book.author}</p>
              {/* Add more book details and functionalities as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
};

export default MyLendingLibrary;
