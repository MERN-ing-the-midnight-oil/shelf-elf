const express = require("express");
const router = express.Router();
const { checkAuthentication } = require("../../../middlewares/authentication");
const fetchGameImage = require("./fetchGameThumbnail");
const User = require("../../models/user"); // Your User model
const Community = require("../../models/community");
const RequestedGame = require("../../models/requestedGame");
const Game = require("../../models/game");

// routes/games/index.js
//search means add a game from the db
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
// route to fetch requested games for the current user
router.get("/my-requested-games", checkAuthentication, async (req, res) => {
	try {
		const requestedGames = await RequestedGame.find({ wantedBy: req.user._id })
			.populate("game")
			.populate("offeredBy");
		res.json(requestedGames);
	} catch (error) {
		res.status(500).json({ message: "Error fetching requested games", error });
	}
});

// PATCH /api/games/request/:gameId

router.patch("/request", checkAuthentication, async (req, res) => {
	const { gameId, ownerUsername } = req.body;

	console.log(
		"Received request for game:",
		gameId,
		"from owner:",
		ownerUsername
	); // Log the incoming request details

	try {
		const game = await Game.findById(gameId);
		const owner = await User.findOne({ username: ownerUsername });
		const requestedBy = req.user._id; // The current authenticated user

		console.log("Found game:", game, "and owner:", owner); // Log found game and owner details

		const newRequestedGame = new RequestedGame({
			game: game._id,
			gameTitle: game.title,
			wantedBy: requestedBy,
			offeredBy: owner._id,
			status: "requested",
			// Add thumbnails or messages, etc
		});

		await newRequestedGame.save();

		console.log("New game request created:", newRequestedGame);

		res.status(201).json({
			message: "Game request created successfully",
			requestedGame: newRequestedGame,
		});
	} catch (error) {
		console.error("Error creating game request:", error);
		res.status(500).json({ message: "Error creating game request", error });
	}
});

// Export the router
module.exports = router;
