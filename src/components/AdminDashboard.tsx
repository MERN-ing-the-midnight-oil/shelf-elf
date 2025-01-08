import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography, Paper } from '@mui/material';
import CommunitiesTable from './CommunitiesTable';
import UsersTable from './UsersTable';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            <Paper elevation={3} sx={{ marginBottom: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab label="Communities" />
                    <Tab label="Users" />
                </Tabs>
            </Paper>
            {activeTab === 0 && <CommunitiesTable />}
            {activeTab === 1 && <UsersTable />}
        </Box>
    );
};

export default AdminDashboard;
