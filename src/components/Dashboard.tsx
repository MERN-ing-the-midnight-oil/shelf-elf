// src/components/Dashboard.tsx
import React from 'react';
import { Button, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Using useAuth hook

const Dashboard: React.FC = () => {
  const { token, setToken } = useAuth(); // Extracting token and setToken from useAuth

  // Dummy user data, replace this with actual user data from your global state or API
  const user = { username: 'John Doe' };

  const handleLogout = () => {
    // Implement logout logic here
    // For example, you might want to remove the token from localStorage and update the global state
    localStorage.removeItem('userToken');
    setToken(null); // Setting token to null in the global state
    console.log('User logged out'); // You might want to redirect the user to the login page here
  };

  return (
    <div>
      <Typography variant="h4">Welcome, {user.username}!</Typography>
      
      {/* ... rest of the component */}

      <div style={{ margin: '20px 0' }}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
