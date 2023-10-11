// src/App.tsx
import React from 'react';
import './App.css';
import LendForm from './components/LendForm';
import RegisterForm from './components/RegisterForm'; 
import LoginForm from './components/LoginForm'; 
import Dashboard from './components/Dashboard';
import MyLendingLibrary from './components/MyLendingLibrary'; 
import { Typography } from '@mui/material';
import { AuthProvider } from './context/AuthContext'; // Adjust the path as needed

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Other's Covers: A Neighborhood Book Sharing App</h1>
        <h2>Because good pensives make good neighbors.</h2>
      </header>
      
      <img src={process.env.PUBLIC_URL + '/libraries.png'} alt="Library" style={{ width: '90%', margin: '1rem 0' }} />

      <main>
        <AuthProvider>
          {/* You can conditionally render these based on user navigation or other logic */}
          <RegisterForm />
          <hr style={{ margin: '2rem 0' }} /> {/* Add a divider or style as needed */}
          <LoginForm />
          {/* Add conditional rendering here to display either login/register form or dashboard based on auth status */}
          {/* For example, you might check if a token exists and render <Dashboard /> if true */}
          <Dashboard />
          <hr style={{ margin: '2rem 0' }} />
          <h1>My Lending Library:</h1>
          <MyLendingLibrary />
        </AuthProvider>
      
        {/* The components below might or might not need access to the auth context. Adjust as necessary. */}
        <LendForm />
        <hr style={{ margin: '2rem 0' }} /> {/* Add another divider or style as needed */}
      </main>
    </div>
  );
}

export default App;
