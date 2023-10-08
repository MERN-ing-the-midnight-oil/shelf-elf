import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const RegisterForm: React.FC = () => {
  console.log('RegisterForm Component');
  return (
    <Formik
      initialValues={{ username: '', email: '', password: '' }}
      // Add validation and submission logic here
      onSubmit={(values) => {
        console.log('Form Data: ', values);
      }}
    >
      <Form>
        <label htmlFor="username">Username:</label>
        <Field type="text" name="username" id="username" />
        <ErrorMessage name="username" component="div" />
        
        <label htmlFor="email">Email:</label>
        <Field type="email" name="email" id="email" />
        <ErrorMessage name="email" component="div" />

        <label htmlFor="password">Password:</label>
        <Field type="password" name="password" id="password" />
        <ErrorMessage name="password" component="div" />

        <button type="submit">Register</button>
      </Form>
    </Formik>
  );
};

export default RegisterForm; // Ensure this line is present
