const express = require("express");
const router = express.Router();
const Community = require("../../models/community");
const User = require("../../models/user");
const { checkAuthentication } = require("../../../middlewares/authentication");

// POST route to create a new community and become a member of the newly created community
router.post("/create", checkAuthentication, async (req, res) => {
	console.log("Inside /api/communities/create route handler");
	try {
		const { name, description, passcode } = req.body;
		// Create the new community with the passcode
		const newCommunity = new Community({ name, description, passcode });
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
		// Fetch the Community document
		const community = await Community.findById(req.body.communityId);
		if (!community) {
			return res.status(404).json({ message: "Community not found" });
		}

		// Check if the passcode matches
		if (community.passcode !== req.body.passcode) {
			return res.status(401).json({ message: "Invalid passcode" });
		}

		// Check if user is already a member of the community
		if (community.members.includes(req.user._id)) {
			return res
				.status(400)
				.json({ message: "User already a member of this community" });
		}

		// Add user to the community's member list
		community.members.push(req.user._id);
		await community.save();

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
router.get("/user-communities", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id; // Assuming your checkAuthentication middleware sets req.user
		const userCommunities = await Community.find({
			members: userId,
		});
		res.status(200).json(userCommunities);
	} catch (error) {
		console.error("Error fetching user communities:", error);
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
