// src/components/Dashboard.tsx
import React, { useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import MyLendingLibrary from './MyLendingLibrary';
import LendForm from './LendForm';

const Dashboard: React.FC = () => {
  const { user, setToken, setUser } = useAuth(); // Get user and authentication functions

  const token = localStorage.getItem('userToken'); // Retrieve the token from local storage

  // Logout handler
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('userToken'); 
    console.log('User logged out');
  };

  return (
    <div>
      {/* Display the user's name if available */}
      <Typography variant="h4">
        Welcome, {user ? user.username : 'Guest'}!
      </Typography>
      
      {/* Display user's books */}
      <MyLendingLibrary token={token} />

      {/* Form to lend books */}
      <LendForm token={token} />

      {/* Logout button */}
      <div style={{ margin: '20px 0' }}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
