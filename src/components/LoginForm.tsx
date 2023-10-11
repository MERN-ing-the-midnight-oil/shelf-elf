import React from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust the path as needed
import { Formik, Form, Field, FieldProps, ErrorMessage } from 'formik';
import { Typography, Button, TextField } from '@material-ui/core';
import styled from 'styled-components';
import axios from 'axios';
import * as Yup from 'yup';



const validationSchema = Yup.object({
    email: Yup.string().required('Email is required').email('Invalid email address'),
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
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const response = await axios.post('http://localhost:5001/api/users/login', values);
          console.log('Server Response: ', response.data);
          
          // Storing token in localStorage for now, you might want to use a more secure storage method
          localStorage.setItem('userToken', response.data.token);
      
   
      // Now use setToken to update your global state
      setToken(response.data.token); // Adjust based on your actual server response structure

      
          setSubmitting(false);
        } catch (error) {
          console.error('Login Error: ', error);
          // Handle login error here (e.g., show error message to user)
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
