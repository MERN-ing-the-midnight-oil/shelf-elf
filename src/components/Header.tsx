import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Box,
    Tabs,
    Tab,
    Button,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
    const { user, setToken, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(location.pathname);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        setValue(location.pathname);
    }, [location]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/app_icon.png" alt="App Icon" style={{ height: '30px', marginRight: '10px' }} />
                        <Typography variant="h6" color="inherit">
                            Welcome, {user.username}!
                        </Typography>
                    </Box>

                    {isMobile ? (
                        <>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={() => setDrawerOpen(true)}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Drawer
                                anchor="right"
                                open={drawerOpen}
                                onClose={() => setDrawerOpen(false)}
                                PaperProps={{
                                    sx: {
                                        width: 250,
                                        backgroundColor: '#f9f9f9',
                                        color: '#333',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                    },
                                }}
                            >
                                <List>
                                    <ListItem
                                        button
                                        component={Link}
                                        to="/manage-communities"
                                        onClick={() => setDrawerOpen(false)}
                                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                                    >
                                        <ListItemText
                                            primary="Your Social Group(s)"
                                            primaryTypographyProps={{
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}
                                        />
                                    </ListItem>
                                    <ListItem
                                        button
                                        component={Link}
                                        to="/lend-books"
                                        onClick={() => setDrawerOpen(false)}
                                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                                    >
                                        <ListItemText
                                            primary="Your Lending Shelf"
                                            primaryTypographyProps={{
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}
                                        />
                                    </ListItem>
                                    <ListItem
                                        button
                                        component={Link}
                                        to="/request-books"
                                        onClick={() => setDrawerOpen(false)}
                                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                                    >
                                        <ListItemText
                                            primary="Your Wishlist"
                                            primaryTypographyProps={{
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}
                                        />
                                    </ListItem>
                                    <ListItem
                                        button
                                        component={Link}
                                        to="/messages"
                                        onClick={() => setDrawerOpen(false)}
                                        sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                                    >
                                        <ListItemText
                                            primary="Messages"
                                            primaryTypographyProps={{
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}
                                        />
                                    </ListItem>
                                    {user.role === 'admin' && (
                                        <ListItem
                                            button
                                            component={Link}
                                            to="/admin-dashboard"
                                            onClick={() => setDrawerOpen(false)}
                                            sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
                                        >
                                            <ListItemText
                                                primary="Admin Controls"
                                                primaryTypographyProps={{
                                                    fontSize: '1rem',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                }}
                                            />
                                        </ListItem>
                                    )}
                                    <ListItem
                                        button
                                        onClick={handleLogout}
                                        sx={{
                                            backgroundColor: '#d32f2f',
                                            '&:hover': { backgroundColor: '#c62828' },
                                            color: '#fff',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <ListItemText
                                            primary="Logout"
                                            primaryTypographyProps={{
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}
                                        />
                                    </ListItem>
                                </List>
                            </Drawer>
                        </>
                    ) : (
                        <>
                            <Tabs value={value} onChange={handleChange} aria-label="Navigation Tabs">
                                <Tab label="Your Social Group(s)" value="/manage-communities" component={Link} to="/manage-communities" />
                                <Tab label="Your Lending Shelf" value="/lend-books" component={Link} to="/lend-books" />
                                <Tab label="Your Wishlist" value="/request-books" component={Link} to="/request-books" />
                                <Tab label="Messages" value="/messages" component={Link} to="/messages" />
                                {user.role === 'admin' && (
                                    <Tab label="Admin Controls" value="/admin-dashboard" component={Link} to="/admin-dashboard" />
                                )}
                            </Tabs>
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
