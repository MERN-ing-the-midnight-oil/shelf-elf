// src/components/Dashboard.tsx
import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import MyLendingLibrary from './MyLendingLibrary';
import LendForm from './LendForm';
import AvailableBooks from './AvailableBooks';
import MyRequestedBooks from './MyRequestedBooks'; // Import the new component

const Dashboard: React.FC = () => {
  const { user, setToken, setUser } = useAuth(); // Get user and authentication functions

  const token = localStorage.getItem('userToken'); // Retrieve the token from local storage
  const [refetchCounter, setRefetchCounter] = useState(0);
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
      {/* Display user's requested books */}
      <MyRequestedBooks token={token} />
      {/* Display user's books */}
      <MyLendingLibrary token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />

      {/* Form to lend books */}
      <LendForm token={token} setRefetchCounter={setRefetchCounter} />

      <AvailableBooks />

      {/* Logout button */}
      <div style={{ margin: '20px 0' }}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}

export default Dashboard;