// src/components/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, Tabs, Tab, Button, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
    const { user, setToken, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(location.pathname);

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('userToken');
        navigate('/');
        console.log('User logged out');
    };

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    // If there's no user, return null to render nothing
    if (!user) {
        return null;
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    {/* Welcome message */}
                    <Typography variant="h6" color="inherit" sx={{ marginRight: '20px' }}>
                        Welcome, {user.username}!
                    </Typography>

                    <Tabs value={value} onChange={handleChange} aria-label="Navigation Tabs">
                        <Tab label="Manage Requests" value="/request-books" component={Link} to="/request-books" sx={{ backgroundColor: value === '/request-books' ? 'primary.dark' : 'primary.main', color: 'white', '&.Mui-selected': { color: 'white' } }} />
                        <Tab label="Manage Offerings" value="/lend-books" component={Link} to="/lend-books" sx={{ backgroundColor: value === '/lend-books' ? 'primary.dark' : 'primary.main', color: 'white', '&.Mui-selected': { color: 'white' } }} />
                    </Tabs>

                    <Button color="inherit" onClick={handleLogout} sx={{ marginLeft: 'auto' }}>
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
