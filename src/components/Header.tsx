import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, Tabs, Tab, Button, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
    const { user, setToken, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(location.pathname);

    useEffect(() => {
        setValue(location.pathname);
    }, [location]);

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

    if (!user) {
        return null;
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" color="inherit" sx={{ flexGrow: 0, flexShrink: 0, marginRight: '40px' }}>
                        Welcome, {user.username}!
                    </Typography>
                    <Tabs value={value} onChange={handleChange} aria-label="Navigation Tabs" sx={{ flexGrow: 1, '& .MuiTab-root': { marginRight: '24px' } }}>
                        <Tab
                            label="Your Social Group(s)"
                            value="/manage-communities"
                            component={Link}
                            to="/manage-communities"
                            sx={{
                                color: 'white',
                                '&.Mui-selected': {
                                    backgroundColor: 'secondary.main', // Use theme's secondary color
                                    color: 'white',
                                    fontWeight: 'bold'
                                }
                            }}
                        />
                        <Tab
                            label="Your Lending Shelf"
                            value="/lend-books"
                            component={Link}
                            to="/lend-books"
                            sx={{
                                color: 'white',
                                '&.Mui-selected': {
                                    backgroundColor: 'secondary.main', // Use theme's secondary color
                                    color: 'white',
                                    fontWeight: 'bold'
                                }
                            }}
                        />
                        <Tab
                            label="Your Wishlist"
                            value="/request-books"
                            component={Link}
                            to="/request-books"
                            sx={{
                                color: 'white',
                                '&.Mui-selected': {
                                    backgroundColor: 'secondary.main', // Use theme's secondary color
                                    color: 'white',
                                    fontWeight: 'bold'
                                }
                            }}
                        />

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
