import React from 'react';
import { Formik, Form, Field, ErrorMessage, FieldInputProps, FieldMetaProps } from 'formik';
import { Typography, Button, TextField } from '@material-ui/core';
import styled from 'styled-components';
import axios from 'axios';
import * as Yup from 'yup';

const FormContainer = styled.div` /* Add your styles here */ `;
const ErrorText = styled.div` /* Add your styles here */ `;

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required').min(2, 'Username must be at least 2 characters'),
  email: Yup.string().required('Email is required').email('Invalid email address'),
  password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const RegisterForm: React.FC = () => {
  return (
    <Formik
      initialValues={{ username: '', email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        console.log('Form Values: ', values);
        try {
          const response = await axios.post('http://localhost:5001/api/users', values);
          console.log('Server Response: ', response.data);
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

            <Field name="username">
              {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                <TextField
                  {...field}
                  label="Username"
                  variant="outlined"
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <ErrorMessage name="username" component={ErrorText} />

            <Field name="email">
              {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                <TextField
                  {...field}
                  type="email"
                  label="Email"
                  variant="outlined"
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <ErrorMessage name="email" component={ErrorText} />

            <Field name="password">
              {({ field, meta }: { field: FieldInputProps<string>; meta: FieldMetaProps<string> }) => (
                <TextField
                  {...field}
                  type="password"
                  label="Password"
                  variant="outlined"
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
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
