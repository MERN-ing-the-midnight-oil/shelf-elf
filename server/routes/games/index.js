const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { checkAuthentication } = require("../../../middlewares/authentication");
const fetchGameImage = require("./fetchGameThumbnail");
const User = require("../../models/user");
const Community = require("../../models/community");
const GameRequest = require("../../models/GameRequest");
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
// Assuming LendingLibraryGame is imported
router.post("/lend", checkAuthentication, async (req, res) => {
	const userId = req.user._id;
	const gameId = req.body.gameId;

	try {
		// Find the game to ensure it exists
		const game = await Game.findById(gameId);
		if (!game) {
			console.log("Game not found");
			return res.status(404).json({ message: "Game not found" });
		}

		// Create a new LendingLibraryGame document
		const newLendingLibraryGame = new LendingLibraryGame({
			game: gameId,
			owner: userId,
			requests: [], // Initialize with no requests
			promisedTo: null, // Initialize with no game promised
		});

		// Save the new LendingLibraryGame document
		await newLendingLibraryGame.save();

		console.log(`Game ${gameId} added to user ${userId}'s lending library.`);
		res.status(200).json({
			message: "Game added to lending library successfully",
			lendingLibraryGame: newLendingLibraryGame,
		});
	} catch (error) {
		console.error("Error adding game to lending library:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Route to remove a game from the user's lending library
const LendingLibraryGame = require("../../models/lendingLibraryGame"); // Adjust the path as needed

router.delete("/remove-game/:gameId", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id;
		const gameId = req.params.gameId;

		// Find and remove the LendingLibraryGame document
		// Note: This assumes that gameId passed is the LendingLibraryGame document's ID
		const lendingLibraryGame = await LendingLibraryGame.findOneAndRemove({
			_id: gameId,
			owner: userId, // Ensure that the game belongs to the user making the request
		});

		if (!lendingLibraryGame) {
			return res
				.status(404)
				.json({ message: "Game not found or not owned by user" });
		}

		// Optional: Handle associated game requests (e.g., delete or update them)

		res.json({
			message: "Game removed from lending library successfully.",
			gameId: lendingLibraryGame._id,
		});
	} catch (error) {
		console.error("Error removing game from lending library:", error);
		res
			.status(500)
			.json({ message: "Error removing game from lending library" });
	}
});

// Route to get the logged-in user's lending library games
router.get("/my-library-games", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id; // Assuming checkAuthentication middleware correctly sets req.user
		console.log(`/my-library-games Fetching games for user ID: ${userId}`); // Log the ID of the user whose games are being fetched

		const lendingLibraryGames = await LendingLibraryGame.find({ owner: userId })
			.populate({
				path: "game",
				select: "title bggLink thumbnailUrl", // Only include these fields from the Game model
			})
			.populate({
				path: "requests",
				select: "username", // Only include the username from the User model for requests
			});

		console.log(
			`Found ${lendingLibraryGames.length} games for user ID: ${userId}`
		); // Log the number of games found
		console.log(lendingLibraryGames); // Log the actual game data being returned

		res.json(lendingLibraryGames);
	} catch (error) {
		console.error("Error fetching user's games library:", error);
		res.status(500).json({ message: "Error fetching user's games library" });
	}
});

// route for a user to mark a game in their lendingLibraryGame collection as unavailable
router.patch(
	"/mark-unavailable/:gameId",
	checkAuthentication,
	async (req, res) => {
		const { gameId } = req.params; // Extract the gameId from URL parameters
		console.log(
			`/api/games/mark-unavailable/:gameId is Attempting to mark game as unavailable: ${gameId}`
		); // Log the gameId being processed

		try {
			// Assuming checkAuthentication sets req.user
			const userId = req.user._id;
			console.log(`User ID making the request: ${userId}`); // Log the userId for additional context

			// Find the game and update its availability, ensuring the requester is the owner
			const updatedGame = await LendingLibraryGame.findOneAndUpdate(
				{ _id: gameId, owner: userId },
				{ isAvailable: false },
				{ new: true }
			).populate("game", "title"); // Optionally populate related game details

			if (!updatedGame) {
				console.log(
					"Game not found or user not authorized to update its availability."
				);
				return res.status(404).json({
					message:
						"Game not found or you do not have permission to update its availability.",
				});
			}

			console.log(`Game marked as unavailable: ${updatedGame._id}`);
			res.json(updatedGame);
		} catch (error) {
			console.error("Error marking game as unavailable:", error);
			res
				.status(500)
				.json({ message: "Failed to mark the game as unavailable." });
		}
	}
);

// route for a user to mark a game in their lendingLibraryGame collection as available
router.patch(
	"/mark-available/:gameId",
	checkAuthentication,
	async (req, res) => {
		const { gameId } = req.params; // Extract the gameId from URL parameters
		console.log(
			`/api/games/mark-available/:gameId is Attempting to mark game as available: ${gameId}`
		); // Log the gameId being processed

		try {
			// Assuming checkAuthentication sets req.user
			const userId = req.user._id;
			console.log(`User ID making the request: ${userId}`); // Log the userId for additional context

			// Find the game and update its availability, ensuring the requester is the owner
			const updatedGame = await LendingLibraryGame.findOneAndUpdate(
				{ _id: gameId, owner: userId },
				{ isAvailable: true },
				{ new: true }
			).populate("game", "title"); // Optionally populate related game details

			if (!updatedGame) {
				console.log(
					"Game not found or user not authorized to update its availability."
				);
				return res.status(404).json({
					message:
						"Game not found or you do not have permission to update its availability.",
				});
			}

			console.log(`Game marked as available: ${updatedGame._id}`);
			res.json(updatedGame);
		} catch (error) {
			console.error("Error marking game as available:", error);
			res
				.status(500)
				.json({ message: "Failed to mark the game as available." });
		}
	}
);

//get all games from all users in all your communities
router.get("/gamesFromMyCommunities", checkAuthentication, async (req, res) => {
	console.log("Using the route to get games from all users in a community");

	try {
		// Fetch all communities the current user is part of
		const userCommunities = await Community.find({
			members: req.user._id,
		});
		console.log(
			"Fetched user communities:",
			userCommunities.map((c) => c.name)
		);

		// Extract community IDs
		const communityIds = userCommunities.map((community) => community._id);

		// Fetch all users that are part of these communities
		const usersInCommunities = await User.find({
			communities: { $in: communityIds },
		}).select("_id");
		console.log(
			"Fetched users in communities IDs:",
			usersInCommunities.map((u) => u._id.toString())
		);

		// Fetch all LendingLibraryGames offered by these users
		const lendingLibraryGames = await LendingLibraryGame.find({
			owner: { $in: usersInCommunities.map((user) => user._id) },
		})
			.populate({
				path: "game",
				select: "title bggRating bggId bggLink thumbnailUrl",
			})
			.populate({
				path: "owner",
				select: "username",
			});
		console.log("Fetched lending library games:", lendingLibraryGames.length);

		// Prepare the games info for response
		let gamesInfo = lendingLibraryGames.map((lendingLibraryGame) => ({
			gameIdentification: lendingLibraryGame._id,
			gameTitle: lendingLibraryGame.game.title,
			bggLink: lendingLibraryGame.game.bggLink,
			bggRating: lendingLibraryGame.game.bggRating,
			thumbnailUrl: lendingLibraryGame.game.thumbnailUrl,
			ownerUsername: lendingLibraryGame.owner.username,
		}));
		console.log("Prepared games info:", gamesInfo);

		// Send the response
		res.json(gamesInfo);
	} catch (error) {
		console.error("Error fetching games from community members:", error);
		res
			.status(500)
			.json({ error: "Failed to fetch games from community members" });
	}
});

// PATCH /api/games/request creates a new requested game
router.patch("/request", checkAuthentication, async (req, res) => {
	const { lendingLibraryGameId } = req.body; // Assuming the front end sends the ID of the LendingLibraryGame being requested

	console.log("Received request payload:", req.body); // Log the full payload for debugging

	// Check if lendingLibraryGameId is received correctly
	if (!lendingLibraryGameId) {
		console.error("Missing lendingLibraryGameId in the request", {
			lendingLibraryGameId,
		});
		return res
			.status(400)
			.json({ message: "Missing lendingLibraryGameId in the request" });
	}

	try {
		// Find the LendingLibraryGame being requested
		const lendingLibraryGame = await LendingLibraryGame.findById(
			lendingLibraryGameId
		).populate("owner", "username");

		if (!lendingLibraryGame) {
			console.error(
				"LendingLibraryGame not found with ID:",
				lendingLibraryGameId
			);
			return res.status(404).json({ message: "LendingLibraryGame not found" });
		}

		const requestedBy = req.user._id; // The current authenticated user

		// Create a new GameRequest document
		const newGameRequest = new GameRequest({
			lendingLibraryGame: lendingLibraryGame._id,
			wantedBy: requestedBy,
			status: "requested",
			messages: [], // Initially empty
		});

		await newGameRequest.save();

		// Optionally, update the LendingLibraryGame document to include the requesting user's ObjectId in its requests array
		lendingLibraryGame.requests.push(requestedBy);
		await lendingLibraryGame.save();

		console.log("New game request created successfully:", newGameRequest);

		res.status(201).json({
			message: "Game request created successfully",
			requestedGame: newGameRequest,
		});
	} catch (error) {
		console.error("Error creating game request:", error);
		res.status(500).json({ message: "Error creating game request", error });
	}
});

router.get("/my-requested-games", checkAuthentication, async (req, res) => {
	try {
		const requestedGames = await GameRequest.find({ wantedBy: req.user._id })
			.populate({
				path: "lendingLibraryGame",
				populate: {
					path: "game", // Populates the game details
				},
			})
			.populate({
				path: "lendingLibraryGame",
				populate: {
					path: "owner", // Nested population to get the owner from the lendingLibraryGame
					select: "username", // Just select the username of the owner
				},
			})
			.populate("messages.sender", "username"); // Assuming you want to populate sender's username in messages

		res.json(requestedGames);
	} catch (error) {
		console.error("Error fetching requested games:", error);
		res.status(500).json({ message: "Error fetching requested games", error });
	}
});

// Export the router
module.exports = router;
