import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, FieldProps, ErrorMessage } from 'formik';
import { Typography, Button, TextField } from '@material-ui/core';
import styled from 'styled-components';
import axios from 'axios';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string()
    .required('Password is required')
    .min(5, 'Password must be at least 5 characters long')
    .max(50, 'Password cannot be more than 50 characters long'), // Set a maximum length for passwords
});


const FormContainer = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  width: 300px;
  margin: auto;
`;

const ErrorText = styled.div`
  color: red;
  margin: 5px 0;
`;

const RegisterForm: React.FC = () => {
  const { setToken, setUser } = useAuth();
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);

  return (
    <div className="App-header"> <Formik
      initialValues={{ username: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          // First, register the user
          console.log('Sending registration request with the following registration values:', values);
          const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
          const registrationResponse = await axios.post(`${API_URL}/api/users/register`, values);

          if ((registrationResponse.status === 200 || registrationResponse.status === 201) && registrationResponse.data.user) {
            console.log('Registration successful for user:', registrationResponse.data.user);

            // Next, log the user in using the same credentials
            console.log('Sending login request with the following values:', values);
            const loginResponse = await axios.post(`${API_URL}/api/users/login`, { username: values.username, password: values.password });
            console.log('Login Response:', loginResponse.data);

            if (loginResponse.status === 200 && loginResponse.data.token) {
              const token = loginResponse.data.token;
              localStorage.setItem('userToken', token);
              setToken(token);  // Set token in context
              console.log('Token set in RegisterForm:', token);

              // Then, fetch the user data with the obtained token
              const config = { headers: { Authorization: `Bearer ${token}` } };
              const userResponse = await axios.get(`${API_URL}/api/users/me`, config);
              console.log('User Response:', userResponse.data);
              setUser(userResponse.data);  // Set user data in context

              // Store user's ID in local storage
              const userId = userResponse.data._id;
              if (userId) {
                localStorage.setItem('userId', userId);
              }
            } else {
              console.error('Login failed:', loginResponse.data.message);
            }
          } else {
            console.error('Registration failed:', registrationResponse.data.message);
          }
        } catch (error) {
          console.error('Registration Error:', error);
          setRegistrationStatus('An unexpected error occurred during registration');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <FormContainer>
          <Form>
            <Typography variant="h5" gutterBottom style={{ color: 'var(--form-text-color)' }}>Register</Typography>

            {registrationStatus && <Typography variant="body1" color="primary">{registrationStatus}</Typography>}

            <Field name="username">
              {({ field, meta }: FieldProps) => (
                <div style={{ marginBottom: '16px' }}> {/* Add this div with style */}
                  <TextField
                    {...field}
                    label="User Name"
                    variant="outlined"
                    fullWidth
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                </div>
              )}
            </Field>
            <ErrorMessage name="username" component={ErrorText} />

            <Field name="password">
              {({ field, meta }: FieldProps) => (
                <div style={{ marginBottom: '16px' }}> {/* Optionally add this div with style if you need space below the password field */}
                  <TextField
                    {...field}
                    type="password"
                    label="Password"
                    variant="outlined"
                    fullWidth
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                </div>
              )}
            </Field>
            <ErrorMessage name="password" component={ErrorText} />

            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Register</Button>
          </Form>

        </FormContainer>
      )}
    </Formik></div>

  );
};

export default RegisterForm;