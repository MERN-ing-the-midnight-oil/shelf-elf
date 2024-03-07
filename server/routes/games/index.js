const express = require("express");
const Game = require("../../models/game");
const { checkAuthentication } = require("../../../middlewares/authentication");
const User = require("../../models/user"); // Your User model
const Community = require("../../models/community");
const router = express.Router();
const fetchGameImage = require("./fetchGameThumbnail");

// routes/games/index.js

router.get("/search", checkAuthentication, async (req, res) => {
	const { title } = req.query;

	try {
		let games = await Game.find({
			$text: { $search: title },
		}).sort({ score: { $meta: "textScore" } });

		for (let game of games) {
			if (!game.thumbnailUrl) {
				// If the thumbnail URL is missing, fetch it
				try {
					const thumbnailUrl = await fetchGameImage(game.bggId);
					game.thumbnailUrl = thumbnailUrl;
					await game.save(); // Persist the thumbnail URL
				} catch (fetchError) {
					console.error(
						"Failed to fetch thumbnail for game:",
						game.title,
						fetchError
					);
					// Optionally handle the failure gracefully
				}
			}
		}

		res.json(games);
	} catch (error) {
		console.error("Error searching for games:", error);
		res.status(500).json({ message: "Error searching for games" });
	}
});

// Add a game to the user's library
router.post("/lend", checkAuthentication, async (req, res) => {
	const userId = req.user._id;
	const gameId = req.body.gameId; // Assuming you're sending just the game ID now

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if the game is already in the user's lending library
		const isAlreadyAdded = user.lendingLibraryGames.some((game) =>
			game.equals(gameId)
		);
		if (isAlreadyAdded) {
			return res
				.status(400)
				.json({ message: "Game already added to lending library" });
		}

		// If not already added, push the game ID and save the user
		user.lendingLibraryGames.push(gameId);
		await user.save();

		res.status(200).json(user.lendingLibraryGames);
	} catch (error) {
		console.error("Error adding game to lending library:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Route to remove a game from the user's lending library
router.delete("/remove-game/:gameId", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id;
		const gameId = req.params.gameId;

		// Find the user and remove the gameId from their lendingLibraryGames array
		const user = await User.findByIdAndUpdate(
			userId,
			{ $pull: { lendingLibraryGames: gameId } },
			{ new: true } // Return the updated document
		).populate("lendingLibraryGames"); // Optionally populate the lendingLibraryGames field to return updated list

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({
			message: "Game removed from lending library successfully.",
			lendingLibraryGames: user.lendingLibraryGames,
		});
	} catch (error) {
		console.error("Error removing game from lending library:", error);
		res
			.status(500)
			.json({ message: "Error removing game from lending library" });
	}
});

// Route to get the logged-in user's games library
router.get("/my-library-games", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id; // Assuming your auth middleware sets req.user

		// Find the user and populate their lendingLibraryGames
		const user = await User.findById(userId).populate("lendingLibraryGames");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user.lendingLibraryGames);
	} catch (error) {
		console.error("Error fetching user's games library:", error);
		res.status(500).json({ message: "Error fetching user's games library" });
	}
});
router.get("/gamesFromMyCommunities", checkAuthentication, async (req, res) => {
	console.log("Using the route to get games from all users in a community");

	try {
		const userCommunities = await Community.find({
			members: req.user._id,
		}).populate({
			path: "members",
			populate: {
				path: "lendingLibraryGames",
			},
		});

		console.log(
			`Community names: ${userCommunities
				.map((community) => community.name)
				.join(", ")}`
		);

		let gamesInfo = [];

		userCommunities.forEach((community) => {
			community.members.forEach((member) => {
				if (member._id.toString() !== req.user._id.toString()) {
					member.lendingLibraryGames.forEach((game) => {
						gamesInfo.push({
							gameId: game._id,
							gameTitle: game.title,
							bggLink: game.bggLink,
							bggRating: game.bggRating,
							ownerUsername: member.username,
							communityName: community.name,
						});
					});
				}
			});
		});

		console.log(`Prepared games info: `, gamesInfo);

		res.json(gamesInfo);
	} catch (error) {
		console.error("Error fetching games from community members:", error);
		res
			.status(500)
			.json({ error: "Failed to fetch games from community members" });
	}
});

// GET /api/games/my-requested-games
router.get("/my-requested-games", checkAuthentication, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate("requestedGames");
		res.json(user.requestedGames);
	} catch (error) {
		res.status(500).json({ message: "Error fetching requested games", error });
	}
});
// PATCH /api/games/request/:gameId
router.patch("/request/:gameId", checkAuthentication, async (req, res) => {
	try {
		const game = await Game.findById(req.params.gameId);
		if (!game) {
			return res.status(404).json({ message: "Game not found" });
		}
		await User.findByIdAndUpdate(req.user._id, {
			$addToSet: { requestedGames: game._id },
		});
		res.status(200).json({ message: "Game requested successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error requesting game", error });
	}
});

// Export the router
module.exports = router;
