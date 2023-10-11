// src/components/Dashboard.tsx
import React from 'react';
import { Button, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const Dashboard: React.FC = () => {
  const { user, setToken, setUser } = useAuth(); // Destructure user, setToken, and setUser from the useAuth hook

  // Handler for logout
  const handleLogout = () => {
    // On logout, you would typically want to remove the token and user from the global state
    setToken(null);
    setUser(null);
    // Optionally, remove token from localStorage or cookies if it's stored there
    // localStorage.removeItem('userToken'); // You can remove this if you're not using localStorage
    // Then redirect to login page or somewhere else as needed
    console.log('User logged out'); // Logging for debugging purposes, remove in production
  };

  return (
    <div>
      {/* Checking if user object exists and then accessing its username property */}
      <Typography variant="h4">Welcome, {user ? user.username : 'Guest'}!</Typography> 
      
      {/* ... rest of the component */}
      {/* The buttons can be conditionally rendered based on whether user is null or not, if needed */}

      <div style={{ margin: '20px 0' }}>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;


// Explanation:

// The useAuth hook is invoked to get access to the user object (as well as the setToken and setUser functions).
// The handleLogout function sets both token and user to null when it's called, effectively logging out the user. You can choose to keep or remove the localStorage.removeItem('userToken'); line based on your decision to use localStorage.
// The Typography component uses the user object to dynamically display the username, with a check to ensure user is not null before trying to access user.username.