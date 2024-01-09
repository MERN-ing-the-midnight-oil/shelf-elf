import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, FieldProps, ErrorMessage } from 'formik';
import { Typography, Button, TextField } from '@material-ui/core';
import styled from 'styled-components';
import axios from 'axios';
import * as Yup from 'yup';
import zxcvbn from 'zxcvbn';

//images for dynamic password 
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
  password: Yup.string().required('Password is required'),
  street1: Yup.string().required('Nearest cross street is required'),
  street2: Yup.string().required('Nearest cross street is required'),
  zipCode: Yup.string().required('Zip code is required').matches(/^[0-9]{5}$/, 'Invalid zip code')
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
  const [passwordStrength, setPasswordStrength] = useState<number | null>(null); const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const { setToken, setUser } = useAuth();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setPasswordStrength(zxcvbn(val).score);
    } else {
      setPasswordStrength(null); // Reset the password strength when the field is cleared
    }
  };

  return (
    <Formik
      initialValues={{ username: '', email: '', password: '', street1: '', street2: '', zipCode: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          // First, register the user
          console.log('Sending registration request with the following registration values:', values);

          const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
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
            <Field name="zipCode">
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
                  label="Zip Code"
                  variant="outlined"
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <ErrorMessage name="zipCode" component={ErrorText} />
            <Field name="street1">
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
                  label="Your street"
                  variant="outlined"
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <ErrorMessage name="street1" component={ErrorText} />

            <Field name="street2">
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
                  label="Your nearest cross street"
                  variant="outlined"
                  fullWidth
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <ErrorMessage name="street2" component={ErrorText} />


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
                    {passwordStrength !== null ? (
                      <>
                        <PasswordStrengthBar strength={passwordStrength} />
                        <img src={passwordImages[passwordStrength]} alt="Password strength" style={{ width: '300px', height: '300px' }} />
                        <Typography variant="body2">{passwordCaptions[passwordStrength]}</Typography>
                      </>
                    ) : (
                      <Typography variant="body2">Type in a Password to see its strength</Typography>
                    )}
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