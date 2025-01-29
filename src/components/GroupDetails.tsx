import React, { useState, useEffect } from "react";
import axios from "axios";

interface Member {
    _id: string;
    username: string;
}

interface GroupDetailsProps {
    token: string;
    groupId: string;
    creatorId: string;
    userId: string;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({
    token,
    groupId,
    creatorId,
    userId,
}) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [isCreator, setIsCreator] = useState(false);

    useEffect(() => {
        // Check if the logged-in user is the group creator
        setIsCreator(userId === creatorId);

        // Fetch members of the group
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'; // Ensure this is correct

        const fetchMembers = async () => {
            try {
                console.log(`Fetching members from: ${API_URL}/api/communities/${groupId}/members`);
                const response = await axios.get(
                    `${API_URL}/api/communities/${groupId}/members`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMembers(response.data);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        };


        fetchMembers();
    }, [groupId, token, userId, creatorId]);

    const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001"; // Ensure this matches your backend

    const removeMember = async (memberId: string) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;

        try {
            console.log(`Sending request to remove member: ${API_URL}/api/communities/${groupId}/remove-member`);

            await axios.post(
                `${API_URL}/api/communities/${groupId}/remove-member`,  // ✅ Corrected URL
                { memberId },  // ✅ Sending memberId in the body
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMembers((prev) => prev.filter((member) => member._id !== memberId));
            console.log(`Member ${memberId} removed successfully.`);
        } catch (error) {
            console.error("Error removing member:", error);
            alert("Failed to remove member.");
        }
    };



    return (
        <div>
            <h3>Group Members</h3>
            <ul>
                {members.map((member) => (
                    <li key={member._id}>
                        {member.username}
                        {isCreator && member._id !== userId && (
                            <button onClick={() => removeMember(member._id)}>Delete</button>
                        )}
                    </li>
                ))}
            </ul>
            <hr />
            <button
                onClick={() => {
                    // Logic for leaving the group (not implemented here)
                    alert("Leaving group functionality not implemented yet.");
                }}
            >
                Leave Lending Group
            </button>
        </div>
    );
};

export default GroupDetails;
