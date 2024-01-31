const express = require("express");
const router = express.Router();
const Community = require("../../models/community");

// POST route to create a new community
router.post("/create", async (req, res) => {
	console.log("Creating new community with name:", req.body.name);
	try {
		const newCommunity = new Community({
			name: req.body.name,
			description: req.body.description,
			members: [req.body.creatorId], // Assuming creator's ID is sent in request
		});

		await newCommunity.save();
		res.status(201).json({
			message: "Community created successfully",
			community: newCommunity,
		});
	} catch (error) {
		console.error("Error creating community:", error);
		res.status(500).send("Internal Server Error");
	}
});

// GET route to list all communities
router.get("/list", async (req, res) => {
	console.log("Fetching list of all communities");
	try {
		const communities = await Community.find({});
		res.status(200).json(communities);
	} catch (error) {
		console.error("Error fetching communities:", error);
		res.status(500).send("Internal Server Error");
	}
});

// POST route for a user to join a community
router.post("/join", async (req, res) => {
	console.log(
		"User",
		req.body.userId,
		"requesting to join community",
		req.body.communityId
	);
	try {
		const community = await Community.findById(req.body.communityId);
		if (!community.members.includes(req.body.userId)) {
			community.members.push(req.body.userId);
			await community.save();
			res.status(200).json({ message: "Joined community successfully" });
		} else {
			res
				.status(400)
				.json({ message: "User already a member of this community" });
		}
	} catch (error) {
		console.error("Error joining community:", error);
		res.status(500).send("Internal Server Error");
	}
});

// GET route to list all communities a user belongs to
router.get("/user-communities/:userId", async (req, res) => {
	console.log("Fetching communities for user:", req.params.userId);
	try {
		const userCommunities = await Community.find({
			members: req.params.userId,
		});
		res.status(200).json(userCommunities);
	} catch (error) {
		console.error("Error fetching user communities:", error);
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
