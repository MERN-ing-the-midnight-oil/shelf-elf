const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // Import mongoose
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
		// Limit the search results to the first 10 games
		let games = await Game.find({
			$text: { $search: title },
		})
			.sort({ score: { $meta: "textScore" } })
			.limit(10); // Limit to 10 results

		// Attempt to fetch thumbnailUrl only for these 10 games, if missing
		for (let game of games) {
			if (!game.thumbnailUrl && game.bggId) {
				// Ensure there's a BGG ID to fetch the image
				try {
					const thumbnailUrl = await fetchGameImage(game.bggId); // Assuming this function is async
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

		res.json(games); // This will include up to 10 games with their thumbnails if fetched
	} catch (error) {
		console.error("Error searching for games:", error);
		res.status(500).json({ message: "Error searching for games" });
	}
});
// Add a game to the user's library
router.post("/lend", checkAuthentication, async (req, res) => {
	const userId = req.user._id;
	const gameId = req.body.gameId;

	try {
		const user = await User.findById(userId);
		if (!user) {
			console.log("User not found");
			return res.status(404).json({ message: "User not found" });
		}

		// Directly push the game ID without checking if it's already added
		user.lendingLibraryGames.push(gameId);
		await user.save();

		console.log(`Game ${gameId} added to user ${userId}'s lending library.`);
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
			console.log("User not found for ID:", userId);
			return res.status(404).json({ message: "User not found" });
		}

		console.log(
			`Sending ${user.lendingLibraryGames.length} games for user ${userId}`
		);
		res.json(user.lendingLibraryGames);
	} catch (error) {
		console.error(
			"Error fetching user's games library for user ID",
			userId,
			":",
			error
		);
		res.status(500).json({ message: "Error fetching user's games library" });
	}
});

//get all games from all users in all your communities
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
							gameIdentification: game._id,
							gameTitle: game.title,
							bggLink: game.bggLink,
							bggRating: game.bggRating,
							thumbnailUrl: game.thumbnailUrl,
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
			.populate({
				path: "game",
				select: "title thumbnailUrl bggLink", // Only include specific fields
			})
			.populate({
				path: "offeredBy",
				select: "username", // Only include the username field
			});
		res.json(requestedGames);
	} catch (error) {
		res.status(500).json({ message: "Error fetching requested games", error });
	}
});

// PATCH /api/games/request

router.patch("/request", checkAuthentication, async (req, res) => {
	const { gameId, ownerUsername } = req.body;

	console.log("Received request payload:", req.body); // Log the full payload for debugging

	// Check if gameId and ownerUsername are received correctly
	if (!gameId || !ownerUsername) {
		console.error("Missing gameId or ownerUsername in the request:", {
			gameId,
			ownerUsername,
		});
		return res
			.status(400)
			.json({ message: "Missing gameId or ownerUsername in the request" });
	}

	try {
		const game = await Game.findById(gameId);
		const owner = await User.findOne({ username: ownerUsername });
		const requestedBy = req.user._id; // The current authenticated user

		// Additional checks to ensure game and owner are found
		if (!game) {
			console.error("Game not found with ID:", gameId);
			return res.status(404).json({ message: "Game not found" });
		}
		if (!owner) {
			console.error("Owner not found with username:", ownerUsername);
			return res.status(404).json({ message: "Owner not found" });
		}

		console.log(
			"Processing request for game:",
			game.title,
			"offered by:",
			owner.username
		); // More detailed log

		const newRequestedGame = new RequestedGame({
			game: game._id,
			gameTitle: game.title,
			wantedBy: requestedBy,
			offeredBy: owner._id,
			status: "requested",
			// Add thumbnails or messages, etc
		});

		await newRequestedGame.save();

		console.log("New game request created successfully:", newRequestedGame);

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
