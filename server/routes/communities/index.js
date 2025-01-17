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

// Fetch communities the user belongs to
router.get("/user-communities", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id; // The ID of the logged-in user
		console.log("Fetching communities for user ID:", userId);

		// Fetch all communities where the user is a member
		const communities = await Community.find({
			members: userId,
		}).populate("members", "username _id"); // Populate the members field

		// Log the communities fetched
		console.log(
			"Communities fetched for user:",
			JSON.stringify(communities, null, 2)
		);

		// Respond with the communities
		res.json(communities);
	} catch (error) {
		console.error("Error fetching user communities:", error);
		res.status(500).json({ message: "Error fetching user communities" });
	}
});

router.post("/create", checkAuthentication, async (req, res) => {
	const { name, description, passcode } = req.body;
	const userId = req.user._id; // Get the user ID from req.user

	if (!name || !description || !passcode) {
		return res.status(400).json({ message: "All fields are required." });
	}

	console.log("Creator ID:", userId); // Log the creatorId for debugging

	try {
		const newCommunity = new Community({
			name,
			description,
			passcode,
			creatorId: userId, // Add the creatorId field
			members: [userId], // Optionally add the creator as the first member
		});

		const savedCommunity = await newCommunity.save();

		// Add the new community to the user's list of communities
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
//remove a member of a community you created
router.post(
	"/:communityId/remove-member",
	checkAuthentication,
	async (req, res) => {
		const { communityId } = req.params;
		const { memberId } = req.body;
		const userId = req.user._id;

		try {
			const community = await Community.findById(communityId);

			if (!community) {
				return res.status(404).json({ message: "Community not found" });
			}

			if (community.creatorId.toString() !== userId.toString()) {
				return res.status(403).json({
					message: "Access denied. Only the creator can manage members.",
				});
			}

			community.members.pull(memberId);
			await community.save();

			res.status(200).json({ message: "Member removed successfully" });
		} catch (error) {
			console.error("Error removing member:", error);
			res.status(500).json({ message: "Failed to remove member" });
		}
	}
);

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

// POST route for a user to leave a community
router.post("/:id/leave", checkAuthentication, async (req, res) => {
	try {
		const communityId = req.params.id;
		const userId = req.user._id;

		// Remove the user from the community's members array
		const updatedCommunity = await Community.findByIdAndUpdate(
			communityId,
			{ $pull: { members: userId } },
			{ new: true }
		);

		if (!updatedCommunity) {
			return res.status(404).json({ message: "Community not found" });
		}

		// Remove the community from the user's communities array
		await User.findByIdAndUpdate(userId, {
			$pull: { communities: communityId },
		});

		res.status(200).json({ message: "Successfully left the community" });
	} catch (error) {
		console.error("Error leaving community:", error);
		res.status(500).json({ message: "Failed to leave the community", error });
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

router.delete("/:id/remove-member", checkAuthentication, async (req, res) => {
	const { memberId } = req.body;
	const communityId = req.params.id;
	const userId = req.user._id;

	try {
		const community = await Community.findById(communityId);

		if (!community) {
			return res.status(404).json({ message: "Community not found." });
		}

		if (String(community.creator) !== String(userId)) {
			return res
				.status(403)
				.json({ message: "Only the creator can manage members." });
		}

		community.members = community.members.filter(
			(member) => String(member) !== String(memberId)
		);
		await community.save();

		res.status(200).json({ message: "Member removed successfully." });
	} catch (error) {
		console.error("Error removing member:", error);
		res.status(500).json({ message: "Failed to remove member." });
	}
});

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
//updates group info (group name, passcode, group description) if user is the group creator
router.put("/:communityId/update", checkAuthentication, async (req, res) => {
	const { communityId } = req.params;
	const { name, description, passcode } = req.body;
	const userId = req.user._id;

	try {
		const community = await Community.findById(communityId);

		if (!community) {
			return res.status(404).json({ message: "Community not found" });
		}

		if (community.creatorId.toString() !== userId.toString()) {
			return res
				.status(403)
				.json({ message: "You are not authorized to edit this community" });
		}

		community.name = name || community.name;
		community.description = description || community.description;
		community.passcode = passcode || community.passcode;

		const updatedCommunity = await community.save();
		res.status(200).json({
			message: "Community updated successfully",
			community: updatedCommunity,
		});
	} catch (error) {
		console.error("Error updating community:", error);
		res.status(500).json({ message: "Error updating community", error });
	}
});

router.delete("/:id/remove-member", checkAuthentication, async (req, res) => {
	const { memberId } = req.body;
	const communityId = req.params.id;
	const userId = req.user._id;

	try {
		const community = await Community.findById(communityId);

		if (!community) {
			return res.status(404).json({ message: "Community not found." });
		}

		if (String(community.creator) !== String(userId)) {
			return res
				.status(403)
				.json({ message: "Only the group creator can manage members." });
		}

		community.members = community.members.filter(
			(member) => String(member._id) !== memberId
		);
		await community.save();

		res.status(200).json({ message: "Member removed successfully." });
	} catch (error) {
		console.error("Error removing member:", error);
		res.status(500).json({ message: "Failed to remove member." });
	}
});

module.exports = router;
