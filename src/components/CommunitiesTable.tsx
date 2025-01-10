import React, { useState } from "react";
import axios from "axios";

interface Community {
    _id: string;
    name: string;
    description: string;
    passcode: string;
    members: { _id: string; username: string }[];
}

interface CommunitiesTableProps {
    communities: Community[];
    token: string;
    refreshCommunities: () => void;
}

const CommunitiesTable: React.FC<CommunitiesTableProps> = ({
    communities,
    token,
    refreshCommunities,
}) => {
    const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);

    const openEditModal = async (communityId: string) => {
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
            const response = await axios.get(`${API_URL}/api/communities/${communityId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const community = communities.find((c) => c._id === communityId);
            if (community) {
                setEditingCommunity({ ...community, members: response.data });
            }
        } catch (error) {
            console.error("Error fetching community details:", error);
        }
    };

    const closeEditModal = () => setEditingCommunity(null);

    const removeMember = async (communityId: string, memberId: string) => {
        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
            await axios.delete(`${API_URL}/api/communities/${communityId}/members/${memberId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Member removed successfully");
            refreshCommunities();
            closeEditModal();
        } catch (error) {
            console.error("Error removing member:", error);
        }
    };

    const deleteCommunity = async (communityId: string) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this community? This action cannot be undone."
        );
        if (!confirmDelete) return;

        try {
            const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
            await axios.delete(`${API_URL}/api/communities/${communityId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Community deleted successfully");
            refreshCommunities();
        } catch (error) {
            console.error("Error deleting community:", error);
            alert("Failed to delete community");
        }
    };

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Passcode</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {communities.map((community) => (
                        <tr key={community._id}>
                            <td>{community.name}</td>
                            <td>{community.description}</td>
                            <td>{community.passcode}</td>
                            <td>
                                <button onClick={() => openEditModal(community._id)}>View/Edit</button>
                                <button onClick={() => deleteCommunity(community._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal for Editing Community */}
            {editingCommunity && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit Community: {editingCommunity.name}</h3>
                        <h4>Members</h4>
                        <ul>
                            {editingCommunity.members.map((member) => (
                                <li key={member._id}>
                                    {member.username} ({member._id})
                                    <button onClick={() => removeMember(editingCommunity._id, member._id)}>
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button onClick={closeEditModal}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommunitiesTable;
