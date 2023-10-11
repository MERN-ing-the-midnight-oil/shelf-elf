import React from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust the path as needed
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

  const { setToken } = useAuth(); 
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          const response = await axios.post('http://localhost:5001/api/users/login', values);
          console.log('Server Response: ', response.data);
      
          // Here, I'm assuming your server responds with a 200 status code on success
          // and includes the token in the response data. Adjust this as needed.
          if (response.status === 200 && response.data.token) {
            localStorage.setItem('userToken', response.data.token);
            setToken(response.data.token);
            setSubmitting(false);
          } else {
            // If the response is anything other than a successful status, handle it as an error.
            // Adjust this to fit the actual structure of your server's error response.
            setErrors({ email: ' ', password: response.data.message || 'Invalid credentials' });
            setSubmitting(false);
          }
      
        } catch (error) {
          console.error('Login Error: ', error);
          // If an error is caught, it might be due to network issues or the server being unreachable,
          // or the credentials being invalid. Adjust the error messages as needed.
          setErrors({ email: ' ', password: 'wrong password or server error' });
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
