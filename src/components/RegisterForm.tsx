import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldInputProps, FieldMetaProps } from 'formik';
import { Typography, Button, TextField } from '@material-ui/core';
import styled from 'styled-components';
import axios from 'axios';
import * as Yup from 'yup';
import zxcvbn from 'zxcvbn';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required').min(2, 'Username must be at least 2 characters'),
  email: Yup.string().required('Email is required').email('Invalid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .test('password-strength', 'Password is too weak', (value = '') => {
      return zxcvbn(value).score >= 2;
    }),
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
  height: 10px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 10px;
`;

const PasswordStrengthBar = styled.div<{strength: number}>`
  height: 100%;
  width: ${props => `${props.strength * 25}%`};
  background-color: ${props => {
    switch (props.strength) {
      case 0: return 'red';
      case 1: return 'orange';
      case 2: return 'yellow';
      case 3: return 'lightgreen';
      case 4: return 'green';
      default: return 'red';
    }
  }};
  transition: width 300ms;
`;




const RegisterForm: React.FC = () => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  //hook to hold the registration status
const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPasswordStrength(zxcvbn(val).score);
  };

  return (
    <Formik
      initialValues={{ username: '', email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        console.log('Form Values: ', values);
        try {
          const response = await axios.post('http://localhost:5001/api/users', values);
          if (response.data && response.data.message === 'User created successfully') {
            setRegistrationStatus("You have Successfully registered!");
            // TODO: handle login and redirect to dashboard.
          }
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
         
 {registrationStatus && <Typography variant="body1" color="primary">{registrationStatus}</Typography>}
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
                  </PasswordStrengthMeter>
                </div>
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
