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
        const fetchMembers = async () => {
            try {
                const response = await axios.get(
                    `/api/communities/${groupId}/members`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setMembers(response.data);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        };

        fetchMembers();
    }, [groupId, token, userId, creatorId]);

    const removeMember = async (memberId: string) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;

        try {
            await axios.delete(`/api/communities/${groupId}/remove-member`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { memberId },
            });
            // Remove member locally
            setMembers((prev) => prev.filter((member) => member._id !== memberId));
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
