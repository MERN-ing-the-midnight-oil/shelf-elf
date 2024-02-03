const express = require("express");
const router = express.Router();
const Community = require("../../models/community");
const User = require("../../models/user");
const { checkAuthentication } = require("../../../middlewares/authentication");

// POST route to create a new community and become a member of the newly created community
router.post("/create", checkAuthentication, async (req, res) => {
	console.log("Inside /api/communities/create route handler");
	try {
		const { name, description } = req.body;
		// Create the new community
		const newCommunity = new Community({ name, description });
		await newCommunity.save();

		// Add the community to the user's list of communities
		req.user.communities.push(newCommunity._id);
		await User.findByIdAndUpdate(req.user._id, {
			$push: { communities: newCommunity._id },
		});

		res.status(201).json({
			message: "Community created successfully",
			community: newCommunity,
		});
	} catch (error) {
		console.error(error);
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
router.post("/join", checkAuthentication, async (req, res) => {
	console.log(
		"User",
		req.user._id,
		"requesting to join community",
		req.body.communityId
	);

	try {
		// Update the Community document to include the user
		const community = await Community.findById(req.body.communityId);
		if (!community.members.includes(req.user._id)) {
			community.members.push(req.user._id);
			await community.save();
		} else {
			return res
				.status(400)
				.json({ message: "User already a member of this community" });
		}

		// Update the User document to include the community
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
