const express = require("express");
const router = express.Router();
const Community = require("../../models/community");
const User = require("../../models/user");
const {
	checkAuthentication,
	adminCheck,
} = require("../../../middlewares/authentication");

router.get("/user-communities", checkAuthentication, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate("communities");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(user.communities);
	} catch (error) {
		console.error("Error fetching user communities:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

// Route to create a new community and add the user to this community
router.post("/create", checkAuthentication, async (req, res) => {
	const { name, description, passcode } = req.body;
	const userId = req.user._id;

	try {
		const newCommunity = new Community({
			name,
			description,
			passcode,
			members: [userId],
		});
		const savedCommunity = await newCommunity.save();

		await User.findByIdAndUpdate(
			userId,
			{ $push: { communities: savedCommunity._id } },
			{ new: true }
		);

		res.status(201).json({
			message: "Community created successfully",
			community: savedCommunity,
		});
	} catch (error) {
		console.error("Error creating community:", error);
		res.status(500).json({ message: "Error creating community", error });
	}
});

// GET route to list all communities (Admin only)
router.get("/admin-list", checkAuthentication, adminCheck, async (req, res) => {
	try {
		console.log("GET /admin-list route accessed by:", req.user.username);

		const communities = await Community.find();
		console.log("Communities fetched:", communities);

		res.status(200).json(communities);
	} catch (error) {
		console.error("Error fetching communities:", error.message);
		res.status(500).json({ message: "Failed to fetch communities" });
	}
});

// DELETE route to delete a community by ID (Admin only)
router.delete("/:id", checkAuthentication, adminCheck, async (req, res) => {
	try {
		const communityId = req.params.id;
		const deletedCommunity = await Community.findByIdAndDelete(communityId);
		if (!deletedCommunity) {
			return res.status(404).json({ message: "Community not found" });
		}
		res.status(200).json({ message: "Community deleted successfully" });
	} catch (error) {
		console.error("Error deleting community:", error);
		res.status(500).json({ message: "Failed to delete community" });
	}
});

// Existing routes remain unchanged

// GET route to list all communities (public)
router.get("/list", async (req, res) => {
	try {
		const communities = await Community.find({});
		res.status(200).json(communities);
	} catch (error) {
		console.error("Error fetching communities:", error);
		res.status(500).send("Internal Server Error");
	}
});

// POST route for a user to join a community
router.post("/join", checkAuthentication, async (req, res) => {
	try {
		const community = await Community.findById(req.body.communityId);
		if (!community) {
			return res.status(404).json({ message: "Community not found" });
		}

		if (community.passcode !== req.body.passcode) {
			return res.status(401).json({ message: "Invalid passcode" });
		}

		if (community.members.includes(req.user._id)) {
			return res
				.status(400)
				.json({ message: "User already a member of this community" });
		}

		community.members.push(req.user._id);
		await community.save();

		const user = await User.findById(req.user._id);
		if (!user.communities.includes(req.body.communityId)) {
			user.communities.push(req.body.communityId);
			await user.save();
		}

		res.status(200).json({ message: "Joined community successfully" });
	} catch (error) {
		console.error("Error joining community:", error);
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
