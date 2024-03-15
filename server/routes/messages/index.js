// routes/messages/index.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { checkAuthentication } = require("../../../middlewares/authentication");
const Message = require("../../models/message");
const Community = require("../../models/community"); // Adjust the path as necessary to where your Community model is located

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

//list of users from all user's communities
router.get("/community-usernames", checkAuthentication, async (req, res) => {
	console.log("Fetching community usernames for user ID:", req.user._id);

	try {
		const userCommunities = await Community.find({
			members: req.user._id,
		}).populate("members", "username");

		console.log(`Found ${userCommunities.length} communities for the user.`);

		const communityUsernames = userCommunities.map((community) => {
			console.log(`Processing community: ${community.name}`);
			return {
				communityName: community.name,
				usernames: community.members
					.filter((member) => member._id.toString() !== req.user._id.toString())
					.map((member) => {
						console.log(`Adding username: ${member.username}`);
						return member.username;
					}),
			};
		});

		console.log("Prepared community usernames:", communityUsernames);
		res.json(communityUsernames);
	} catch (error) {
		console.error("Error fetching community usernames:", error);
		res
			.status(500)
			.json({ message: "Error fetching community usernames", error });
	}
});

module.exports = router;
