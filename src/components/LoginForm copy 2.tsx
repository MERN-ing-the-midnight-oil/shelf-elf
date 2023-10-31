import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, FieldProps, ErrorMessage, useFormikContext } from 'formik';
import { Typography, Button, TextField, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';
import * as Yup from 'yup';
import { SelectChangeEvent } from '@mui/material/Select';

const validationSchema = Yup.object({
  email: Yup.string().required('We need your email address').email('Something is strange about that email address'),
  password: Yup.string().required('Password is required'),
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

const dummyUsers = [
  "BrownBear1981@example.com",
  "SalmonSlayer@example.com",
  "GlacierGuider@example.com",
  "RainforestRover@example.com",
  "TotemCarver@example.com",
  "MidnightSunSeeker@example.com",
  "WhaleWatcher@example.com",
  "IcebergInnovator@example.com",
  "FjordFollower@example.com",
  "RavenReveler@example.com",
  "PineTreePioneer@example.com",
  "MooseMarauder@example.com",
  "TundraTraveler@example.com",
  "SitkaSpruceSavant@example.com",
  "EagleEyeEd@example.com",
  "NorthernLightsLover@example.com",
  "KetchikanClimber@example.com",
  "MendenhallMystic@example.com",
  "HalibutHero@example.com",
  "BearberryBuddy@example.com",
];


const LoginForm: React.FC = () => {
  const { setToken, setUser } = useAuth();

  const Dropdown: React.FC = () => {
    const { setFieldValue } = useFormikContext();

    const handleDropdownChange = (event: SelectChangeEvent) => {
      const selectedEmail = event.target.value as string;
      if (selectedEmail) {
        setFieldValue("email", selectedEmail);
        setFieldValue("password", "BigBlueBus");
      }
    };

    return (
      <FormControl fullWidth variant="outlined" style={{ marginBottom: '20px' }}>
        <InputLabel id="select-user-label">Select a user for testing purposes</InputLabel>
        <Select
          labelId="select-user-label"  // Connects the label with the select dropdown
          onChange={handleDropdownChange}
          defaultValue=""
        >
          <MenuItem value="" disabled>
            Select a user
          </MenuItem>
          {dummyUsers.map(email => (
            <MenuItem key={email} value={email}>
              {email}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

    );
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          // First, the user logs in
          console.log('Sending login request with values: ', values);
          const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

          const loginResponse = await axios.post(`${API_URL}/api/users/login`, values);
          console.log('Login Response to : ', loginResponse.data);
          console.log('Login Request Headers:', loginResponse.config.headers);
          if (loginResponse.status === 200 && loginResponse.data.token) {
            const token = loginResponse.data.token;
            localStorage.setItem('userToken', token);
            setToken(token);  // Set token in context

            // Then, fetch the user data with the obtained token
            const config = { headers: { Authorization: `Bearer ${token}` } };
            console.log('Fetch User Request Headers:', config.headers);
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

            const userResponse = await axios.get(`${API_URL}/api/users/me`, config);
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

            <Dropdown />

            <Field name="email">
              {({ field, form }: FieldProps) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  helperText={form.touched.email && typeof form.errors.email === 'string' ? form.errors.email : undefined}
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
                  helperText={form.touched.password && typeof form.errors.password === 'string' ? form.errors.password : undefined}
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
