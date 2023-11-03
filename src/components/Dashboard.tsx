// src/components/Dashboard.tsx
import React from 'react';
import { Button, Typography, Tabs, Tab } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, setToken, setUser } = useAuth(); // Get user and authentication functions
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('userToken');
    console.log('User logged out');
    navigate('/'); // Navigate back to the home page after logout
  };

  // Tab navigation handler
  const handleTabNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div>
      {/* Display the user's name if available */}
      <Typography variant="h4" style={{ margin: '20px 0' }}>
        Welcome, {user ? user.username : 'Guest'}!
      </Typography>

      {/* Tabs for navigation */}
      <Tabs
        orientation="horizontal"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Dashboard navigation tabs"
      >
        <Tab label="Manage offerings" onClick={() => handleTabNavigation('/lend-books')} />
        <Tab label="Manage requests" onClick={() => handleTabNavigation('/request-books')} />
      </Tabs>

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
