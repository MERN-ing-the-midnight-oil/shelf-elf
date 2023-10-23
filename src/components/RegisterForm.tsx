import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, FieldProps, ErrorMessage } from 'formik';
import { Typography, Button, TextField } from '@material-ui/core';
import styled from 'styled-components';
import axios from 'axios';
import * as Yup from 'yup';
import zxcvbn from 'zxcvbn';

//images for dynamic password fun thing
import weakImage from '../images/weak-image.png';
import belowAverageImage from '../images/below-average-image.png';
import averageImage from '../images/average-image.png';
import strongImage from '../images/strong-image.png';
import veryStrongImage from '../images/very-strong-image.png';
const passwordImages = [
  weakImage,
  belowAverageImage,
  averageImage,
  strongImage,
  veryStrongImage
];

const passwordCaptions = [
  "If your password was a book it would be... trashy pulp fiction found in the mud.",
  "If your password were a book it would be... a paperback novel with coffee stains.",
  "If your password were a book it would be... a good read, but with some torn pages.",
  "If your password were a book it would be... a rare classic in almost perfect condition.",
  "If your password were a book it would be... the great American novel, first edition, signed by the author."
];

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string().required('We need your email address').email('Something is strange about that email address'),
  password: Yup.string().required('Password is required')
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

const PasswordStrengthMeter = styled.div`
  margin-top: 10px;
`;

const PasswordStrengthBar = styled.div<{ strength: number }>`
  height: 5px;
  width: ${(props) => (props.strength * 20)}%;
  background-color: ${(props) => (props.strength === 0 ? '#ccc' : props.strength === 1 ? 'red' : props.strength === 2 ? 'orange' : props.strength === 3 ? 'yellow' : 'green')};
  transition: width 0.3s ease-in-out;
`;

const RegisterForm: React.FC = () => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const { setToken, setUser } = useAuth();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPasswordStrength(zxcvbn(val).score);
  };

  return (
    <Formik
      initialValues={{ username: '', email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          // First, register the user
          console.log('Sending registration request with values:', values);
          const API_URL = process.env.REACT_APP_BACKEND_URL;

          const registrationResponse = await axios.post(`${API_URL}/api/users/register`, values);

          if ((registrationResponse.status === 200 || registrationResponse.status === 201) && registrationResponse.data.user) {
            console.log('Registration successful for user:', registrationResponse.data.user);

            // Next, log the user in using the same credentials
            console.log('Sending login request with the following values:', values);
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const loginResponse = await axios.post(`${API_URL}/api/users/login`, values);
            console.log('Login Response:', loginResponse.data);

            if (loginResponse.status === 200 && loginResponse.data.token) {
              const token = loginResponse.data.token;
              localStorage.setItem('userToken', token);
              setToken(token);  // Set token in context
              console.log('Token set in RegisterForm:', token);


              // Then, fetch the user data with the obtained token
              const config = { headers: { Authorization: `Bearer ${token}` } };
              const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
              const userResponse = await axios.get(`${API_URL}/api/users/me`, config);
              console.log('User Response:', userResponse.data);
              setUser(userResponse.data);  // Set user data in context

              // Store user's ID in local storage
              const userId = userResponse.data._id;
              if (userId) {
                localStorage.setItem('userId', userId);
              }

              setSubmitting(false);
            } else {
              setErrors({ email: ' ', password: loginResponse.data.message || 'Invalid credentials after registration' });
              setSubmitting(false);
            }
          } else {
            setErrors({ email: registrationResponse.data.message || 'Error during registration', password: ' ' });
            setSubmitting(false);
          }
        } catch (error) {
          console.error('Registration Error:', error);
          setErrors({ email: 'Error during registration', password: ' ' });
          setSubmitting(false);
        }
      }}

    >
      {({ isSubmitting }) => (
        <FormContainer>
          <Form>
            <Typography variant="h5" gutterBottom>Register</Typography>
            {registrationStatus && <Typography variant="body1" color="primary">{registrationStatus}</Typography>}

            <Field name="username">
              {({ field, meta }: FieldProps) => (
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
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
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
              {({ field, meta }: FieldProps) => (
                <div>
                  <TextField
                    {...field}
                    type="password"
                    label="Password"
                    variant="outlined"
                    fullWidth
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(e);
                      handlePasswordChange(e);
                    }}

                  />
                  <PasswordStrengthMeter>
                    <PasswordStrengthBar strength={passwordStrength} />
                    <img src={passwordImages[passwordStrength]} alt="Password strength" style={{ width: '300px', height: '300px' }} />
                    <Typography variant="body2">{passwordCaptions[passwordStrength]}</Typography>
                  </PasswordStrengthMeter>
                </div>
              )}
            </Field>
            <ErrorMessage name="password" component={ErrorText} />

            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Register</Button>
          </Form>
        </FormContainer>
      )}
    </Formik>
  );
};

export default RegisterForm;

//TODO handle possible errors relating to the username. 