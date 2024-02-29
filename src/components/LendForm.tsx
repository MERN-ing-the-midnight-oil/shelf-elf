import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Container, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';

//creating debouncer
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...funcArgs: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), wait);
  };
}


const BookSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!'),
});

const FormContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

interface LendFormProps {
  token: string | null;
  setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;

}

const LendForm: React.FC<LendFormProps> = ({ token, setRefetchCounter }) => {
  const [searchResults, setSearchResults] = useState([]);
  const apiKey = process.env.REACT_APP_API_KEY;

  //state to track selected books from search
  const [offeredBooks, setOfferedBooks] = useState<Set<string>>(new Set());


  const handleSearch = (value: string) => {
    if (value) {
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${value}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => setSearchResults(data.items || []))
        .catch(error => console.error(error));
    }
  };
  //creating a debounced version of handleSearch
  const debouncedHandleSearch = debounce(handleSearch, 300);


  const handleOwnBookClick = (book: any) => {
    console.log('Book data received:', book);

    if (!token) {
      console.error('Token not found.');
      return;
    }

    const bookData = {
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors && book.volumeInfo.authors.join(', '),
      description: book.volumeInfo.description,
      imageUrl: book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail,
      googleBooksId: book.id,
      currentBorrower: null,
    };

    console.log('Book data to send:', bookData);

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    fetch(`${API_URL}/api/books/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookData)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errData => {
            console.error('Error from server:', errData);
            throw new Error('Network response was not ok');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Book added to library:', data);
        setRefetchCounter(prev => prev + 1);
        // Add the book's ID to the offeredBooks set
        setOfferedBooks(prevBooks => new Set(prevBooks.add(book.id)));
      })
      .catch(error => {
        console.error('Error during fetch operation: ', error);
      });
  };

  const renderSearchResults = searchResults.map((book: any) => (
    <div key={book.id}>
      <p>{book.volumeInfo.title} by {book.volumeInfo.authors && book.volumeInfo.authors.join(', ')}</p>
      {book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail && (
        <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
      )}
      {offeredBooks.has(book.id) ? (
        <span>YOU HAVE ADDED THIS TITLE TO YOUR OFFERINGS</span>
      ) : (
        <button onClick={() => handleOwnBookClick(book)}>Offer to lend</button>
      )}
    </div>
  ));


  return (
    <FormContainer>
      <Typography variant="h5" gutterBottom>
        Add book titles to your books lending shelf:
      </Typography>
      <Formik
        initialValues={{ title: '' }}
        validationSchema={BookSchema}
        onSubmit={(values, actions) => {
          handleSearch(values.title);
          actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting, handleChange, values }) => (
          <Form>
            <TextField
              fullWidth
              margin="normal"
              name="title"
              onChange={(e) => {
                handleChange(e);
                debouncedHandleSearch(e.target.value);
              }}
              value={values.title}
              label="Book Title"
              variant="outlined"
              placeholder="Start typing to search..."
            />
            <ErrorMessage name="title" component="div" />

            {isSubmitting && <CircularProgress />}
          </Form>
        )}
      </Formik>
      <div>
        {renderSearchResults}
      </div>
    </FormContainer>
  );
};

export default LendForm;
