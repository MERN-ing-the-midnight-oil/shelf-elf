const express = require("express");
const router = express.Router();
const { checkAuthentication } = require("../../../middlewares/authentication");
const User = require("../../models/user");
const Community = require("../../models/community");
const GameRequest = require("../../models/gameRequest");
const axios = require("axios");
const xml2js = require("xml2js");
const Game = require("../../models/game");

// Search for games by title
router.get("/search", checkAuthentication, async (req, res) => {
	const { title } = req.query;

	if (!title) {
		return res.status(400).json({ message: "Title is required" });
	}

	try {
		const localGames = await Game.find({ title: new RegExp(title, "i") }).limit(
			10
		);

		const parser = new xml2js.Parser();

		// Step 1: Check for missing thumbnails in local games
		for (const game of localGames) {
			if (!game.thumbnailUrl || game.thumbnailUrl === null) {
				try {
					const detailUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${game.bggId}&stats=1`;
					const detailResponse = await axios.get(detailUrl);
					const detailResult = await parser.parseStringPromise(
						detailResponse.data
					);
					const detailGame = detailResult.items.item[0];

					// Update the game's thumbnail in the database
					game.thumbnailUrl = detailGame.thumbnail
						? detailGame.thumbnail[0]
						: null;
					await game.save();

					console.log(
						`Updated thumbnail for game ${game.title} (${game.bggId}): ${game.thumbnailUrl}`
					);
				} catch (error) {
					console.error(
						`Error updating thumbnail for game ${game.title} (${game.bggId}):`,
						error
					);
				}
			}
		}

		// Return updated local games to the frontend
		if (localGames.length > 0) {
			return res.json(localGames);
		}

		// Step 2: Fallback to the BGG API if no local matches
		const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(
			title
		)}&type=boardgame`;
		const searchResponse = await axios.get(searchUrl);
		const searchResult = await parser.parseStringPromise(searchResponse.data);

		if (searchResult.items.$.total === "0") {
			return res.status(404).json({ message: "No games found" });
		}

		const games = [];
		for (const game of searchResult.items.item) {
			const gameId = game.$.id;
			const detailUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`;

			try {
				const detailResponse = await axios.get(detailUrl);
				const detailResult = await parser.parseStringPromise(
					detailResponse.data
				);
				const detailGame = detailResult.items.item[0];

				const thumbnail = detailGame.thumbnail ? detailGame.thumbnail[0] : null;
				const image = detailGame.image ? detailGame.image[0] : null;

				games.push({
					bggId: gameId,
					title: game.name[0].$.value,
					bggLink: `https://boardgamegeek.com/boardgame/${gameId}`,
					thumbnailUrl: thumbnail,
					image: image,
					bggRating: null, // Placeholder
				});
			} catch (detailError) {
				console.error(
					`Error fetching details for game ID ${gameId}:`,
					detailError
				);
			}
		}

		// Save new games to the database
		await Game.insertMany(games, { ordered: false }).catch((err) => {
			if (err.code !== 11000)
				console.error("Error saving games to DB:", err.message);
		});

		res.json(games);
	} catch (error) {
		console.error("Error searching games:", error);
		res.status(500).json({ message: "Error searching games", error });
	}
});

// Add a game to the user's lending library
router.post("/lend", checkAuthentication, async (req, res) => {
	const userId = req.user._id;
	const gameId = req.body.gameId;

	try {
		// Verify that the game exists
		const game = await Game.findById(gameId);
		if (!game) {
			console.log("Game not found");
			return res.status(404).json({ message: "Game not found" });
		}

		// Create a new LendingLibraryGame document
		const LendingLibraryGame = require("../../models/lendingLibraryGame");
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

// Remove a game from the user's lending library
router.delete("/remove-game/:gameId", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id;
		const gameId = req.params.gameId;

		const LendingLibraryGame = require("../../models/lendingLibraryGame");

		// Find and remove the game
		const lendingLibraryGame = await LendingLibraryGame.findOneAndRemove({
			_id: gameId,
			owner: userId,
		});

		if (!lendingLibraryGame) {
			return res
				.status(404)
				.json({ message: "Game not found or not owned by user" });
		}

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

// Additional routes (e.g., mark available/unavailable) remain unchanged

module.exports = router;

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

//show all my requested games
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

// lets a user take back their game request without deleting the record
// POST /api/games/rescind-game-request/:requestId
router.patch(
	"/rescind-game-request/:requestId",
	checkAuthentication,
	async (req, res) => {
		const { requestId } = req.params;
		console.log(`Rescinding game request with ID: ${requestId}`); // Log the requestId being processed
		const userId = req.user._id; // Assuming checkAuthentication middleware adds the user ID to the request
		console.log(`User ID attempting to rescind request: ${userId}`); // Log the userId for debugging

		try {
			// Find the game request and ensure it's made by the current user
			const gameRequest = await GameRequest.findOneAndUpdate(
				{
					_id: requestId,
					wantedBy: userId,
				},
				{
					$set: { status: "rescinded" },
				},
				{ new: true }
			);

			if (!gameRequest) {
				console.log("Game request not found or not authorized to rescind.");
				return res.status(404).json({
					message:
						"Game request not found or you're not authorized to rescind it.",
				});
			}

			console.log(`Game request with ID: ${requestId} rescinded successfully.`);
			res.json({ message: "Game request rescinded successfully", gameRequest });
		} catch (error) {
			console.error("Error rescinding game request:", error);
			res.status(500).json({ message: "Error rescinding game request", error });
		}
	}
);

// Export the router
module.exports = router;
