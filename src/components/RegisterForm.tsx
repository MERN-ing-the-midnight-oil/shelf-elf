import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, TextField, Container, Typography } from '@mui/material';
import { styled } from '@mui/system';

const FormContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '5rem',
  padding: '2rem',
  backgroundColor: '#f0f0f0',
  borderRadius: '8px',
});

const StyledField = styled(Field)({
  margin: '1rem 0',
});

const ErrorText = styled('div')({
  color: 'red',
});

const RegisterForm: React.FC = () => {
  return (
    <Formik
      initialValues={{ username: '', email: '', password: '' }}
      // Add validation and submission logic here
      onSubmit={(values) => {
        console.log('Form Data: ', values);
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
