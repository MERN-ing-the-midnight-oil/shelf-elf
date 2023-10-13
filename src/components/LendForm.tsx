import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Typography, Container, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';

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
}

const LendForm: React.FC<LendFormProps> = ({ token }) => {
  const [searchResults, setSearchResults] = useState([]);
  const apiKey = process.env.REACT_APP_API_KEY;

  const handleSearch = (value: string) => {
    if (value) {
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${value}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => setSearchResults(data.items || []))
        .catch(error => console.error(error));
    }
  };

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

    fetch('http://localhost:5001/books/add', {
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
      <button onClick={() => handleOwnBookClick(book)}>Offer to lend</button>
    </div>
  ));

  return (
    <FormContainer>
      <Typography variant="h5" gutterBottom>
        Add new titles to your lending library
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
              onChange={handleChange}
              value={values.title}
              label="Book Title"
              variant="outlined"
            />
            <ErrorMessage name="title" component="div" />
            <Button type="submit" disabled={isSubmitting} variant="contained" color="primary">
              Submit book title
            </Button>
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
