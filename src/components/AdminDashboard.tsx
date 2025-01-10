import React, { useState, useEffect } from "react";
import axios from "axios";
import CommunitiesTable from "./CommunitiesTable";

interface Community {
    _id: string;
    name: string;
    description: string;
    passcode: string;
    members: { _id: string; username: string; email?: string }[];
}

interface AdminDashboardProps {
    token: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

    const fetchCommunities = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/api/communities/admin-list`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCommunities(response.data);
        } catch (error) {
            console.error("Error fetching communities:", error);
            setError("Failed to fetch communities. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            {loading && <p>Loading communities...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
                <CommunitiesTable
                    communities={communities}
                    refreshCommunities={fetchCommunities}
                    token={token}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
