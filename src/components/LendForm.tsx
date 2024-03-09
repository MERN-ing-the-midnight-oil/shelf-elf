import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Container, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { SharedComponentProps } from '../types'; // Adjust the path as needed

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

const LendForm: React.FC<SharedComponentProps> = ({ token, setRefetchCounter, refetchCounter }) => {
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

  interface Book {
    id: string;
    volumeInfo: {
      title: string;
      authors: string[];
      description: string;
      imageLinks?: {
        thumbnail?: string;
      };
    };
  }
  const handleOwnBookClick = async (book: Book) => {
    console.log('Book data received:', book);

    if (!token) {
      console.error('Token not found.');
      return;
    }

    const bookData = {
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors && book.volumeInfo.authors.join(', '),
      description: book.volumeInfo.description,
      imageUrl: book.volumeInfo.imageLinks?.thumbnail,
      googleBooksId: book.id,
      currentBorrower: null,
    };

    console.log('Book data to send:', bookData);

    const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    try {
      const response = await fetch(`${API_URL}/api/books/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });

      if (response.ok) {
        console.log('Book added to library:', await response.json());
        setRefetchCounter((prev) => prev + 1);
        setSearchResults([]); // Clear the search results after successful addition
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error during fetch operation: ', error);
    }
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
