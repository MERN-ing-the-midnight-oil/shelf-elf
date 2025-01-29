const express = require("express");
const router = express.Router();
const Community = require("../../models/community");
const User = require("../../models/user");
const {
	checkAuthentication,
	adminCheck,
} = require("../../../middlewares/authentication");

// =============================
// Public Routes
// =============================

// List all communities
// List all communities
router.get("/list", async (req, res) => {
	try {
		console.log("Fetching all communities...");
		const communities = await Community.find({});
		console.log("Communities found:", JSON.stringify(communities, null, 2));
		res.status(200).json(communities);
	} catch (error) {
		console.error("Error fetching communities:", error);
		res.status(500).send("Internal Server Error");
	}
});

// =============================
// User-Specific Routes
// =============================

// Fetch communities the user belongs to
// Fetch communities the user belongs to
router.get("/user-communities", checkAuthentication, async (req, res) => {
	const userId = req.user._id;
	console.log("Fetching communities for user ID:", userId);

	try {
		const communities = await Community.find({ members: userId }).populate(
			"members",
			"username _id"
		);

		if (communities.length === 0) {
			console.log(`No communities found for user ID: ${userId}`);
		} else {
			console.log(
				`Fetched ${communities.length} communities for user ID: ${userId}`
			);
			console.log(
				"Communities fetched:",
				JSON.stringify(
					communities.map((c) => ({ id: c._id, name: c.name })),
					null,
					2
				)
			); // Log only basic community details
		}

		res.status(200).json(communities);
	} catch (error) {
		console.error(
			"Error fetching user communities for user ID:",
			userId,
			error
		);
		res.status(500).json({ message: "Error fetching user communities" });
	}
});

// Create a new community
router.post("/create", checkAuthentication, async (req, res) => {
	const { name, description, passcode } = req.body;
	const userId = req.user._id;

	if (!name || !description || !passcode) {
		return res.status(400).json({ message: "All fields are required." });
	}

	console.log("Creating a new community with creator ID:", userId);

	try {
		const newCommunity = new Community({
			name,
			description,
			passcode,
			creatorId: userId,
			members: [userId],
		});

		const savedCommunity = await newCommunity.save();
		await User.findByIdAndUpdate(userId, {
			$push: { communities: savedCommunity._id },
		});

		console.log("Community created successfully:", savedCommunity._id);
		res.status(201).json({
			message: "Community created successfully",
			community: savedCommunity,
		});
	} catch (error) {
		console.error("Error creating community:", error);
		res.status(500).json({ message: "Error creating community" });
	}
});

// Join a community
router.post("/join", checkAuthentication, async (req, res) => {
	const { communityId, passcode } = req.body;
	const userId = req.user._id;

	try {
		const community = await Community.findById(communityId);
		if (!community)
			return res.status(404).json({ message: "Community not found" });
		if (community.passcode !== passcode)
			return res.status(401).json({ message: "Invalid passcode" });

		if (!community.members.includes(userId)) {
			community.members.push(userId);
			await community.save();
			await User.findByIdAndUpdate(userId, {
				$push: { communities: communityId },
			});
		}

		console.log(`User ${userId} joined community ${communityId}`);
		res.status(200).json({ message: "Joined community successfully" });
	} catch (error) {
		console.error("Error joining community:", error);
		res.status(500).send("Internal Server Error");
	}
});

// Leave a community
router.post("/:id/leave", checkAuthentication, async (req, res) => {
	const { id: communityId } = req.params;
	const userId = req.user._id;

	try {
		const updatedCommunity = await Community.findByIdAndUpdate(
			communityId,
			{ $pull: { members: userId } },
			{ new: true }
		);

		if (!updatedCommunity)
			return res.status(404).json({ message: "Community not found" });

		await User.findByIdAndUpdate(userId, {
			$pull: { communities: communityId },
		});
		console.log(`User ${userId} left community ${communityId}`);
		res.status(200).json({ message: "Successfully left the community" });
	} catch (error) {
		console.error("Error leaving community:", error);
		res.status(500).json({ message: "Failed to leave the community" });
	}
});

// =============================
// Creator-Specific Routes
// =============================
// Fetch members of a community (Only for the creator)
router.get("/:communityId/members", checkAuthentication, async (req, res) => {
	try {
		const { communityId } = req.params;
		const userId = req.user._id;

		// Find the community and check if the user is the creator
		const community = await Community.findById(communityId).populate(
			"members",
			"username _id"
		);
		if (!community) {
			return res.status(404).json({ message: "Community not found" });
		}

		if (community.creatorId.toString() !== userId.toString()) {
			return res
				.status(403)
				.json({ message: "Only the creator can manage members." });
		}

		res.status(200).json(community.members);
	} catch (error) {
		console.error("Error fetching community members:", error);
		res.status(500).json({ message: "Failed to fetch community members" });
	}
});

// Remove a member from a community
router.post(
	"/:communityId/remove-member",
	checkAuthentication,
	async (req, res) => {
		const { communityId } = req.params;
		const { memberId } = req.body;
		const userId = req.user._id;

		try {
			const community = await Community.findById(communityId);

			if (!community)
				return res.status(404).json({ message: "Community not found" });
			if (community.creatorId.toString() !== userId.toString())
				return res.status(403).json({
					message: "Access denied. Only the creator can manage members.",
				});

			console.log(`Removing member ${memberId} from community ${communityId}`);
			community.members.pull(memberId);
			await community.save();

			console.log(`Member ${memberId} removed from community ${communityId}`);
			res.status(200).json({ message: "Member removed successfully" });
		} catch (error) {
			console.error("Error removing member:", error);
			res.status(500).json({ message: "Failed to remove member" });
		}
	}
);

// =============================
// Admin Routes
// =============================

// Fetch all communities (Admin only)
router.get("/admin-list", checkAuthentication, adminCheck, async (req, res) => {
	try {
		const communities = await Community.find();
		res.status(200).json(communities);
	} catch (error) {
		console.error("Error fetching communities:", error);
		res.status(500).json({ message: "Failed to fetch communities" });
	}
});

// Get members of a specific community (Admin only)
router.get(
	"/:id/members",
	checkAuthentication,
	adminCheck,
	async (req, res) => {
		try {
			const community = await Community.findById(req.params.id).populate(
				"members",
				"username email _id"
			);
			if (!community)
				return res.status(404).json({ message: "Community not found" });

			res.status(200).json(community.members);
		} catch (error) {
			console.error("Error fetching community members:", error);
			res.status(500).json({ message: "Failed to fetch community members" });
		}
	}
);

// =============================
// Export the Router
// =============================
module.exports = router;
