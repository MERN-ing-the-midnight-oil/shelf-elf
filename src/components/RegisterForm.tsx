import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Typography, Button, TextField } from '@material-ui/core';
import styled from 'styled-components';
import axios from 'axios';

const FormContainer = styled.div` /* Add your styles here */ `;
const StyledField = styled(Field)` /* Add your styles here */ `;
const ErrorText = styled.div` /* Add your styles here */ `;

const RegisterForm: React.FC = () => {
  return (
    <Formik
      initialValues={{ username: '', email: '', password: '' }}
      // Add validation logic here if necessary
      onSubmit={async (values, { setSubmitting }) => {
        try {
          // Send a post request to your API endpoint for user registration
          const response = await axios.post('http://localhost:5001/users', values);
          console.log('Server Response: ', response.data); // Log server response
          setSubmitting(false);
        } catch (error) {
          console.error('Registration Error: ', error);
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <FormContainer>
          <Form>
            <Typography variant="h5" gutterBottom>
              Register
            </Typography>

            <StyledField
              name="username"
              as={TextField}
              label="Username"
              variant="outlined"
              fullWidth
            />
            <ErrorMessage name="username" component={ErrorText} />

            <StyledField
              name="email"
              type="email"
              as={TextField}
              label="Email"
              variant="outlined"
              fullWidth
            />
            <ErrorMessage name="email" component={ErrorText} />

            <StyledField
              name="password"
              type="password"
              as={TextField}
              label="Password"
              variant="outlined"
              fullWidth
            />
            <ErrorMessage name="password" component={ErrorText} />

            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              Register
            </Button>
          </Form>
        </FormContainer>
      )}
    </Formik>
  );
};

export default RegisterForm;
