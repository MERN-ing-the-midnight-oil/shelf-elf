import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
	Button,
	TextField,
	Container, // If you are using Container as FormContainer
	Typography,
	CircularProgress,
	Select,
	MenuItem,
	FormControl,
	InputLabel
} from '@mui/material';
import { styled } from '@mui/system';
import { generateTitles, generateAuthors } from './bookGenerator';


const FormContainer = styled(Container)({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
});

interface LendFormManualProps {
	token: string | null;
	setRefetchCounter: (value: React.SetStateAction<number>) => void;
}

// Define the validation schema using Yup

const BookSchema = Yup.object().shape({
	title: Yup.string().required('Title is required'),
	author: Yup.string().required('Author is required'),
	genre: Yup.string().required('Genre is required'),
	// ...add other fields with appropriate validation
});

const genreOptions = ["Fiction", "Non-Fiction", "Fantasy", "Mystery", "Sci-Fi", "Other"];
const fictionalTitles = generateTitles(10); // Generate 10 random titles
const authors = generateAuthors(10); // Generate 10 random authors

const LendFormManual: React.FC<LendFormManualProps> = ({ token, setRefetchCounter }) => {

	// Define the function to post data to the backend
	const addBookToLibrary = (bookData: any, setSubmitting: (isSubmitting: boolean) => void) => {
		if (!token) {
			console.error('Token not found.');
			return;
		}

		const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
		fetch(`${API_URL}/api/books/add`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify(bookData),
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
			})
			.catch(error => {
				console.error('Error during fetch operation: ', error);
			})
			.finally(() => {
				setSubmitting(false);
			});
	};
	return (
		<FormContainer>
			<Typography variant="h5" gutterBottom>
				Add offerings by entering book information manually:
			</Typography>
			<Formik
				initialValues={{
					title: '',
					author: '',
					genre: '',
					// ...initialize other fields
				}}
				validationSchema={BookSchema}
				onSubmit={(values, { setSubmitting }) => {
					console.log(values);
					// Here you could call an API to add the book
					addBookToLibrary(values, setSubmitting);
					// After submission, you might want to refetch data
					setRefetchCounter(prev => prev + 1);

					setSubmitting(false);
				}}
			>
				{({ isSubmitting, handleChange, values, errors, touched }) => (
					<Form>
						{/* Title Field with Datalist */}
						<Field
							as={TextField}
							fullWidth
							margin="normal"
							name="title"
							onChange={handleChange}
							value={values.title}
							label="Book Title"
							variant="outlined"
							error={touched.title && Boolean(errors.title)}
							helperText={touched.title && errors.title}
							inputProps={{
								list: 'title-options' // Referencing datalist by id
							}}
						/>
						<datalist id="title-options">
							{fictionalTitles.map((title, index) => (
								<option key={index} value={title} />
							))}
						</datalist>

						{/* Author Field with Datalist */}
						<Field
							as={TextField}
							fullWidth
							margin="normal"
							name="author"
							onChange={handleChange}
							value={values.author}
							label="Author Name"
							variant="outlined"
							error={touched.author && Boolean(errors.author)}
							helperText={touched.author && errors.author}
							inputProps={{
								list: 'author-options' // Referencing datalist by id
							}}
						/>
						<datalist id="author-options">
							{authors.map((author, index) => (
								<option key={index} value={author} />
							))}
						</datalist>

						{/* Genre Field as Select */}
						<FormControl fullWidth margin="normal">
							<InputLabel id="genre-label">Genre</InputLabel>
							<Field
								as={Select}
								name="genre"
								labelId="genre-label"
								id="genre"
								onChange={handleChange}
								value={values.genre}
								label="Genre"
								error={touched.genre && Boolean(errors.genre)}
							>
								{genreOptions.map(option => (
									<MenuItem key={option} value={option}>{option}</MenuItem>
								))}
							</Field>
							<ErrorMessage name="genre" component="div" />
						</FormControl>

						{/* Submit Button */}
						<Button
							type="submit"
							color="primary"
							variant="contained"
							disabled={isSubmitting}
						>
							{isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
						</Button>
					</Form>

				)}
			</Formik>
		</FormContainer>
	);
};

export default LendFormManual;