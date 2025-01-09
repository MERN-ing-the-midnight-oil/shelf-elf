import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, FieldProps, ErrorMessage } from 'formik';
import { Typography, Button, TextField } from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import * as Yup from 'yup';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
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

const LoginForm: React.FC = () => {
  const { setToken, setUser } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate(); // Initialize navigate
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="App-header">
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            const loginResponse = await axios.post(`${API_URL}/api/users/login`, values);

            if (isMounted.current) {
              if (loginResponse.status === 200 && loginResponse.data.token) {
                const token = loginResponse.data.token;
                localStorage.setItem('userToken', token);
                setToken(token);

                const config = { headers: { Authorization: `Bearer ${token}` } };
                const userResponse = await axios.get(`${API_URL}/api/users/me`, config);

                setUser(userResponse.data);

                const userId = userResponse.data._id;
                if (userId) {
                  localStorage.setItem('userId', userId);
                }

                // Redirect based on user role
                if (userResponse.data.role === 'admin') {
                  navigate('/admin/dashboard'); // Redirect admin users
                } else {
                  navigate('/'); // Redirect regular users
                }
              } else {
                setErrors({ username: ' ', password: loginResponse.data.message || 'Invalid credentials' });
              }
            }
          } catch (error) {
            if (isMounted.current) {
              setErrors({ username: ' ', password: 'Invalid credentials or server error' });
            }
          } finally {
            if (isMounted.current) {
              setSubmitting(false);
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <FormContainer>
            <Form>
              <Typography variant="h5" gutterBottom style={{ color: 'var(--form-text-color)' }}>Login</Typography>
              <Field name="username">
                {({ field, form }: FieldProps) => (
                  <TextField
                    {...field}
                    label="Username"
                    variant="outlined"
                    fullWidth
                    helperText={form.touched.username && typeof form.errors.username === 'string' ? form.errors.username : undefined}
                    error={form.touched.username && Boolean(form.errors.username)}
                    style={{ marginBottom: '16px' }}
                  />
                )}
              </Field>
              <ErrorMessage name="username" component={ErrorText} />

              <Field name="password">
                {({ field, form }: FieldProps) => (
                  <TextField
                    {...field}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    variant="outlined"
                    fullWidth
                    helperText={form.touched.password && typeof form.errors.password === 'string' ? form.errors.password : undefined}
                    error={form.touched.password && Boolean(form.errors.password)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handlePasswordVisibility}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    style={{ marginBottom: '20px' }} // Added space between password field and button
                  />
                )}
              </Field>
              <ErrorMessage name="password" component={ErrorText} />

              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} style={{ marginTop: '20px' }}>Login</Button>
            </Form>
          </FormContainer>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;
