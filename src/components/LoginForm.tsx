import React from 'react';
import { useAuth } from '../context/AuthContext'; 
import { Formik, Form, Field, FieldProps, ErrorMessage,  } from 'formik';
import { Typography, Button, TextField } from '@material-ui/core';
import styled from 'styled-components';
import axios from 'axios';
import * as Yup from 'yup';



const validationSchema = Yup.object({
    email: Yup.string().required('We need your email address').email('Something is strange about that email address'),
    password: Yup.string().required('Password is required'),
  });

const FormContainer = styled.div`
  /* Add your specific styles here. For example: */
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  width: 300px;
  margin: auto;
`;

const ErrorText = styled.div`
  /* Add your specific styles here. For example: */
  color: red;
  margin: 5px 0;
`;


const LoginForm: React.FC = () => {
  const { setToken, setUser } = useAuth();  // added setUser

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          // First, the user logs in
          console.log('Sending login request with values: ', values);
          const loginResponse = await axios.post('http://localhost:5001/api/users/login', values);
          console.log('Login Response to : ', loginResponse.data);
          console.log('Login Request Headers:', loginResponse.config.headers);
          if (loginResponse.status === 200 && loginResponse.data.token) {
            const token = loginResponse.data.token;
            localStorage.setItem('userToken', token);
            setToken(token);  // Set token in context
            
            // Then, fetch the user data with the obtained token
            const config = { headers: { Authorization: `Bearer ${token}` } };
            console.log('Fetch User Request Headers:', config.headers);
            // ADJUST THIS PATH TO THE ENDPOINT THAT RETURNS THE AUTHENTICATED USER'S DATA
            const userResponse = await axios.get('http://localhost:5001/api/users/me', config);
            console.log('User Response: ', userResponse.data);
            setUser(userResponse.data);  // Set user data in context
    
            // Store user's ID in local storage
            const userId = userResponse.data._id;
            if (userId) {
              localStorage.setItem('userId', userId);
            }
            
            setSubmitting(false);
          } else {
            setErrors({ email: ' ', password: loginResponse.data.message || 'Invalid credentials' });
            setSubmitting(false);
          }
        } catch (error) {
          console.error('Login Error: ', error);
          setErrors({ email: ' ', password: 'Invalid credentials or server error' });
          setSubmitting(false);
        }
      }}
    
    >
      {({ isSubmitting }) => (
        <FormContainer>
          <Form>
            <Typography variant="h5" gutterBottom>Login</Typography>
            <Field name="email">
              {({ field, form }: FieldProps) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  helperText={form.errors.email && form.touched.email && form.errors.email}
                  error={form.touched.email && Boolean(form.errors.email)}
                />
              )}
            </Field>
            <ErrorMessage name="email" component={ErrorText} />
            
            <Field name="password">
              {({ field, form }: FieldProps) => (
                <TextField
                  {...field}
                  type="password"
                  label="Password"
                  variant="outlined"
                  fullWidth
                  helperText={form.errors.password && form.touched.password && form.errors.password}
                  error={form.touched.password && Boolean(form.errors.password)}
                />
              )}
            </Field>
            <ErrorMessage name="password" component={ErrorText} />
            
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Login</Button>
          </Form>
        </FormContainer>
      )}
    </Formik>
  );
};

export default LoginForm;
