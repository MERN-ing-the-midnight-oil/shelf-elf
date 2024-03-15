import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Tooltip, Card, CardContent, Typography, List, ListItem, Divider, TextField, Button } from '@mui/material';

interface SharedComponentProps {
    token: string;
}
interface UserDetail {
    username: string;
    userId: string;
}

// interface CommunityUsernames {
//     communityName: string;
//     userDetails: UserDetail[]; // Adjusted to use the UserDetail interface
// }

// interface CommunityUsernames {
//     communityName: string;
//     users: { username: string; userId: string; }[]; // Adjusted to reflect the structure
// }

interface CommunityUsernames {
    communityName: string;
    usernames: { username: string; userId: string; }[];
}


interface Message {
    sender: string;
    recipient: string;
    messageText: string;
    createdAt: string;
}
interface SelectedUser {
    username: string;
    userId: string;
}



const Messages: React.FC<SharedComponentProps> = ({ token }) => {
    const [communityUsernames, setCommunityUsernames] = useState<CommunityUsernames[]>([]);
    const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');


    useEffect(() => {
        const fetchCommunityUsernames = async () => {
            const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
            console.log('Attempting to fetch community usernames'); // Log before fetching
            try {
                const response = await axios.get(`${API_URL}/api/messages/community-usernames`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Fetched community usernames:', response.data); // Log the received data
                // Assuming the backend is adjusted to return data in the expected format
                setCommunityUsernames(response.data);
                console.log("here is the community user names response data which is hopefully an array: " + (response.data));
            } catch (error) {
                console.error('Error fetching community usernames:', error);
            }
        };

        fetchCommunityUsernames();
    }, [token]);


    const selectUser = (username: string, userId: string) => {
        setSelectedUser({ username, userId });
    };


    //

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!selectedUser || newMessage.trim() === '') {
            console.log('No user selected or message is empty');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/messages/send`, {
                recipientUsername: selectedUser.username,
                messageText: newMessage,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                console.log("Message sent successfully");
                setNewMessage(''); // Reset message input after sending
                // Optionally, refresh the messages or update the UI as needed
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };


    useEffect(() => {
        if (!token || !selectedUser) return;
        const fetchMessages = async () => {
            try {
                const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

                // Use selectedUser.userId to fetch the conversation
                const response = await axios.get(`${API_URL}/api/messages/conversation/${selectedUser.userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        console.log('Fetching messages with fetchMessages');
    }, [token, selectedUser]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {/* {communityUsernames && communityUsernames.map(({ communityName, users }) => ( */}
            {communityUsernames.map(({ communityName, usernames }) => (
                <Card key={communityName} sx={{ maxWidth: 300, minWidth: 280, overflow: 'auto', flexBasis: '280px', flexGrow: 1 }}>
                    <CardContent>
                        <Typography variant="h5">{communityName}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <List>
                            {/* {users.map(({ username, userId }) => ( // Adjusted mapping to use `users` array */}
                            {usernames.map(({ username, userId }) => (
                                <Tooltip key={userId} title={`Click to chat with ${username}`}>
                                    <ListItem button onClick={() => selectUser(username, userId)} style={{ cursor: 'pointer' }}>
                                        <Typography variant="body2" style={{ textDecoration: 'underline' }}>{username}</Typography>
                                    </ListItem>
                                </Tooltip>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            ))}

            {selectedUser && (
                <Box sx={{ maxWidth: 300, minWidth: 280, overflow: 'auto', flexBasis: '280px', flexGrow: 1, mt: 2 }}>
                    <Typography variant="h6">Conversation with {selectedUser.username}</Typography>
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {messages.length > 0 ? messages.map((message, index) => (
                            <ListItem key={index}>
                                <Typography variant="body2">
                                    {message.sender === selectedUser.userId ? `${selectedUser.username}: ` : "You: "}
                                    {message.messageText} - {new Date(message.createdAt).toLocaleString()}
                                </Typography>
                            </ListItem>
                        )) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>No messages yet.</Typography>
                        )}

                    </List>
                    <Box component="form" onSubmit={handleSendMessage} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" color="primary">
                            Send
                        </Button>
                    </Box>
                </Box>
            )}

        </Box>

    );
};

export default Messages;