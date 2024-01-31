// src/components/ManageCommunities.tsx

import React from 'react';
import CommunityForm from './CommunityForm';

interface ManageCommunitiesProps {
    token: string;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
}

const ManageCommunities: React.FC<ManageCommunitiesProps> = ({ token, setRefetchCounter }) => {
    // You can now use the token and setRefetchCounter props as needed within this component
    return (
        <div>
            <h1>Manage Communities</h1>
            <CommunityForm token={token} />
            {/* Additional functionalities can be added here */}
        </div>
    );
}

export default ManageCommunities;
