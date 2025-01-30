import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, FieldProps, ErrorMessage } from 'formik';
import { Typography, Button, TextField } from '@material-ui/core';
import styled from 'styled-components';
import axios from 'axios';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .required("Password is required")
    .min(5, "Password must be at least 5 characters long")
    .max(50, "Password cannot be more than 50 characters long"),
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address"),
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
    <Formik
      initialValues={{ username: "", password: "", email: "" }} // Add email to initial values
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          console.log("Sending registration request with the following values:", values);
          const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

          // Step 1: Register the user
          const registrationResponse = await axios.post(`${API_URL}/api/users/register`, values);

          if (
            (registrationResponse.status === 200 || registrationResponse.status === 201) &&
            registrationResponse.data.user
          ) {
            console.log("Registration successful for user:", registrationResponse.data.user);

            // Step 2: Log the user in
            console.log("Sending login request with the following values:", values);
            const loginResponse = await axios.post(`${API_URL}/api/users/login`, {
              username: values.username,
              password: values.password,
            });
            console.log("Login Response:", loginResponse.data);

            if (loginResponse.status === 200 && loginResponse.data.token) {
              const token = loginResponse.data.token;
              localStorage.setItem("userToken", token); // Save token in localStorage
              setToken(token); // Set token in context
              console.log("Token set in RegisterForm:", token);

              // Step 3: Fetch the logged-in user's data
              const config = { headers: { Authorization: `Bearer ${token}` } };
              const userResponse = await axios.get(`${API_URL}/api/users/me`, config);
              console.log("User Response:", userResponse.data);

              setUser(userResponse.data); // Set user data in context

              // Save user ID in localStorage
              const userId = userResponse.data._id;
              if (userId) {
                localStorage.setItem("userId", userId);
              }

              // Redirect to dashboard
              window.location.href = "/dashboard"; // Update to match your app's dashboard route
            } else {
              console.error("Login failed:", loginResponse.data.message);
              setRegistrationStatus("Login failed. Please check your credentials.");
            }
          } else {
            console.error("Registration failed:", registrationResponse.data.message);
            setRegistrationStatus("Registration failed. Please try again.");
          }
        } catch (error) {
          console.error("Registration Error:", error);
          setRegistrationStatus("An unexpected error occurred during registration.");
        } finally {
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
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
                  label="User Name/Nickname"
                  variant="outlined"
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <ErrorMessage name="username" component={ErrorText} />

            <Field name="password">
              {({ field, meta }: FieldProps) => (
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

            {/* Add email field */}
            <Field name="email">
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
                  id="email" // ✅ Ensure the label is linked to the input
                  label="Email (for receiving requests and offers from friends in-app)"
                  variant="outlined"
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <ErrorMessage name="email" component={ErrorText} />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              Register
            </Button>
          </Form>
        </FormContainer>
      )}
    </Formik>
  );

};

export default RegisterForm;