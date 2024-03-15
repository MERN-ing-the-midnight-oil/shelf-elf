// routes/messages/index.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { checkAuthentication } = require("../../../middlewares/authentication");
const Message = require("../../models/message");
const Community = require("../../models/community"); // Adjust the path as necessary to where your Community model is located
const User = require("../../models/user");

// Route to get all messages between the logged-in user and a specified user
router.get("/with/:userId", checkAuthentication, async (req, res) => {
	const currentUser = req.user._id;
	const otherUserId = req.params.userId;

	try {
		const messages = await Message.find({
			$or: [
				{
					$and: [
						{ sender: currentUser },
						{ receiver: mongoose.Types.ObjectId(otherUserId) },
					],
				},
				{
					$and: [
						{ sender: mongoose.Types.ObjectId(otherUserId) },
						{ receiver: currentUser },
					],
				},
			],
		}).sort({ createdAt: 1 }); // Sorts the messages chronologically

		res.json(messages);
	} catch (error) {
		console.error("Error fetching messages:", error);
		res.status(500).json({ message: "Failed to fetch messages", error });
	}
});

//list of users and their ids from all user's communities
router.get("/community-usernames", checkAuthentication, async (req, res) => {
	try {
		const userCommunities = await Community.find({
			members: req.user._id,
		}).populate("members", "username _id");

		const communityUsernames = userCommunities.map((community) => ({
			communityName: community.name,
			usernames: community.members
				.map((member) => ({
					username: member.username,
					userId: member._id,
				}))
				.filter((user) => user.userId.toString() !== req.user._id.toString()), // Exclude the current user
		}));

		res.json(communityUsernames);
	} catch (error) {
		console.error("Error fetching community usernames:", error);
		res
			.status(500)
			.json({ message: "Error fetching community usernames", error });
	}
});

// POST route to send a message
router.post("/send", checkAuthentication, async (req, res) => {
	const { recipientUsername, messageText } = req.body;
	const senderId = req.user._id; // Assuming your authentication middleware adds the user object to req

	try {
		// Find the recipient user ID based on the username
		const recipient = await User.findOne({ username: recipientUsername });
		if (!recipient) {
			return res.status(404).json({ message: "Recipient not found" });
		}

		// Create a new message using the correct field name
		const newMessage = new Message({
			sender: senderId,
			receiver: recipient._id, // Use 'receiver' to match the schema
			messageText,
			createdAt: new Date(),
			read: false, // Optional, as it defaults to false
		});

		// Save the message
		await newMessage.save();

		res
			.status(201)
			.json({ message: "Message sent successfully", data: newMessage });
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({ message: "Error sending message", error });
	}
});

// GET route to fetch messages between the current user and another specified user by ObjectId
router.get("/conversation/:userId", checkAuthentication, async (req, res) => {
	const { userId } = req.params;
	const currentUserId = req.user._id;

	console.log(
		`Fetching conversation between current user ${currentUserId} and user ${userId}`
	);

	try {
		const otherUser = await User.findById(userId);
		if (!otherUser) {
			console.error(`User not found with ID: ${userId}`);
			return res.status(404).json({ message: "User not found" });
		}

		const messages = await Message.find({
			$or: [
				{ sender: currentUserId, receiver: otherUser._id },
				{ sender: otherUser._id, receiver: currentUserId },
			],
		})
			.sort({ createdAt: 1 }) // Sorting by creation time for chronological order
			.populate("sender", "username") // Populate to include sender username
			.populate("receiver", "username"); // Populate to include receiver username

		console.log(`Found ${messages.length} messages`);

		res.json(
			messages.map((message) => ({
				// Format the response as needed
				senderUsername: message.sender.username,
				receiverUsername: message.receiver.username,
				messageText: message.messageText,
				createdAt: message.createdAt,
			}))
		);
	} catch (error) {
		console.error("Error fetching conversation:", error);
		res.status(500).json({ message: "Error fetching conversation", error });
	}
});

// // gets message history between two users
// router.get(
// 	"/conversation/:receiverId",
// 	checkAuthentication,
// 	async (req, res) => {
// 		const { receiverId } = req.params;
// 		const senderId = req.user._id;

// 		try {
// 			const messages = await Message.find({
// 				$or: [
// 					{ sender: senderId, receiver: receiverId },
// 					{ sender: receiverId, receiver: senderId },
// 				],
// 			})
// 				.sort({ createdAt: 1 })
// 				.populate("sender", "username")
// 				.populate("receiver", "username");

// 			res.json(messages);
// 		} catch (error) {
// 			console.error("Error fetching messages:", error);
// 			res.status(500).json({ message: "Error fetching messages", error });
// 		}
// 	}
// );

module.exports = router;
