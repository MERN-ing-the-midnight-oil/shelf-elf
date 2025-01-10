const express = require("express");
const router = express.Router();
const Community = require("../../models/community");
const User = require("../../models/user");
const {
	checkAuthentication,
	adminCheck,
} = require("../../../middlewares/authentication");

// Routes for public and authenticated user actions
router.get("/list", async (req, res) => {
	try {
		const communities = await Community.find({});
		res.status(200).json(communities);
	} catch (error) {
		console.error("Error fetching communities:", error);
		res.status(500).send("Internal Server Error");
	}
});

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

// Admin routes
router.get("/admin-list", checkAuthentication, adminCheck, async (req, res) => {
	try {
		const communities = await Community.find();
		res.status(200).json(communities);
	} catch (error) {
		console.error("Error fetching communities:", error.message);
		res.status(500).json({ message: "Failed to fetch communities" });
	}
});
// Get members of a specific community
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
			if (!community) {
				return res.status(404).json({ message: "Community not found" });
			}
			res.status(200).json(community.members);
		} catch (error) {
			console.error("Error fetching community members:", error);
			res.status(500).json({ message: "Failed to fetch community members" });
		}
	}
);

router.put("/:id", checkAuthentication, adminCheck, async (req, res) => {
	try {
		const { id } = req.params;
		const { name, description, passcode } = req.body;
		const updatedCommunity = await Community.findByIdAndUpdate(
			id,
			{ name, description, passcode },
			{ new: true }
		);
		if (!updatedCommunity) {
			return res.status(404).json({ message: "Community not found" });
		}
		res.status(200).json(updatedCommunity);
	} catch (error) {
		console.error("Error updating community:", error);
		res.status(500).json({ message: "Failed to update community" });
	}
});

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

// DELETE route to remove a member from a community (Admin only)
router.delete(
	"/:id/members/:memberId",
	checkAuthentication,
	adminCheck,
	async (req, res) => {
		try {
			const { id: communityId, memberId } = req.params;

			const community = await Community.findById(communityId);
			if (!community) {
				return res.status(404).json({ message: "Community not found" });
			}

			// Check if the member exists in the community
			const memberIndex = community.members.indexOf(memberId);
			if (memberIndex === -1) {
				return res
					.status(404)
					.json({ message: "Member not found in this community" });
			}

			// Remove the member
			community.members.splice(memberIndex, 1);
			await community.save();

			res.status(200).json({ message: "Member removed successfully" });
		} catch (error) {
			console.error("Error removing member:", error);
			res.status(500).json({ message: "Failed to remove member" });
		}
	}
);

module.exports = router;
