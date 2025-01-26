const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { checkAuthentication } = require("../../../middlewares/authentication");
const fetchGameImage = require("./fetchGameImage");
const xml2js = require("xml2js");
const axios = require("axios");
const User = require("../../models/user");
const Community = require("../../models/community");
const GameRequest = require("../../models/gameRequest");
const Game = require("../../models/game");
const LendingLibraryGame = require("../../models/lendingLibraryGame");

// SEARCH ROUTE
router.get("/search", checkAuthentication, async (req, res) => {
	console.log("Search route called with query:", req.query);
	const { title } = req.query;

	if (!title) {
		return res.status(400).json({ message: "Title is required." });
	}

	try {
		console.log("Search title received:", title);

		let games = await Game.find({
			$text: { $search: `"${title}"` },
		})
			.sort({ score: { $meta: "textScore" } })
			.limit(10);

		console.log("Results from $text search:", games);

		if (games.length === 0) {
			console.log("No phrase matches found. Trying regex...");
			const regex = new RegExp(title, "i");
			games = await Game.find({ title: regex }).limit(10);
			console.log("Results from regex search:", games);
		}

		if (games.length === 0) {
			console.log("No local matches found. Querying BGG API...");
			const cleanedTitleForBGG = title
				.replace(/\b(Board Game|Board|Game)\b/gi, "")
				.trim();
			console.log("Cleaned title for BGG API:", cleanedTitleForBGG);

			const bggUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(
				cleanedTitleForBGG
			)}&type=boardgame`;

			try {
				const bggResponse = await axios.get(bggUrl);
				console.log("Raw BGG API response:", bggResponse.data);

				const parsedData = await xml2js.parseStringPromise(bggResponse.data, {
					mergeAttrs: true,
				});
				const bggGames = parsedData.items?.item || [];
				console.log("Parsed BGG games:", bggGames);

				games = await Promise.all(
					bggGames
						.filter(
							(item) =>
								Array.isArray(item.name) &&
								item.name.some((n) => n.type?.[0] === "primary")
						)
						.map(async (item) => {
							const primaryName = item.name.find(
								(n) => n.type?.[0] === "primary"
							);
							const bggId = parseInt(item.id[0], 10);
							const thumbnailUrl = await fetchGameImage(bggId).catch((err) => {
								console.error(
									`Error fetching thumbnail for BGG ID ${bggId}:`,
									err
								);
								return null;
							});
							console.log(
								`Fetched thumbnail for BGG ID ${bggId}:`,
								thumbnailUrl
							);

							return {
								title: primaryName?.value?.[0] || "Unknown Title",
								bggId,
								yearPublished: item.yearpublished?.[0]?.value?.[0] || "Unknown",
								bggLink: `https://boardgamegeek.com/boardgame/${bggId}`,
								bggRating: null,
								thumbnailUrl,
							};
						})
				);

				console.log("Filtered and mapped games with thumbnails:", games);
			} catch (error) {
				console.error("Error querying BGG API:", error);
			}
		}

		res.json(games);
	} catch (error) {
		console.error("Error during search:", error);
		res.status(500).json({ message: "Error searching for games" });
	}
});

// ADD GAME TO USER LIBRARY
router.post("/lend", checkAuthentication, async (req, res) => {
	console.log("Lend route called with body:", req.body);

	const userId = req.user._id;
	const { gameId } = req.body;

	if (!gameId) {
		console.error("Missing gameId in request body.");
		return res.status(400).json({ message: "gameId is required." });
	}

	try {
		let game;

		// Validate and fetch game based on gameId
		if (mongoose.Types.ObjectId.isValid(gameId)) {
			// If gameId is a valid MongoDB ObjectId
			console.log("gameId is a valid ObjectId:", gameId);
			game = await Game.findById(gameId);
		} else if (!isNaN(gameId)) {
			// If gameId is a number (bggId)
			console.log("gameId is a valid bggId:", gameId);
			game = await Game.findOne({ bggId: parseInt(gameId, 10) });
		} else {
			console.error("Invalid gameId format:", gameId);
			return res.status(400).json({ message: "Invalid gameId format." });
		}

		if (!game) {
			console.error("Game not found for gameId:", gameId);
			return res.status(404).json({ message: "Game not found." });
		}

		// Create a new LendingLibraryGame document
		const newLendingLibraryGame = new LendingLibraryGame({
			game: game._id, // Use the MongoDB ObjectId
			owner: userId,
			requests: [],
			promisedTo: null,
		});

		await newLendingLibraryGame.save();
		console.log(
			`Game ${game._id} added to lending library for user ${userId}.`
		);

		res.status(200).json({
			message: "Game added to lending library successfully.",
			lendingLibraryGame: newLendingLibraryGame,
		});
	} catch (error) {
		console.error("Error in lend route:", error);
		res.status(500).json({ message: "Error adding game to lending library." });
	}
});

// REMOVE GAME FROM LIBRARY
router.delete("/remove-game/:gameId", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id;
		const gameId = req.params.gameId;

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

// GET USER'S LIBRARY GAMES
router.get("/my-library-games", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id;
		const lendingLibraryGames = await LendingLibraryGame.find({ owner: userId })
			.populate("game", "title bggLink thumbnailUrl")
			.populate("requests", "username");

		res.json(lendingLibraryGames);
	} catch (error) {
		console.error("Error fetching user's games library:", error);
		res.status(500).json({ message: "Error fetching user's games library" });
	}
});

// REQUEST GAME
router.patch("/request", checkAuthentication, async (req, res) => {
	const { lendingLibraryGameId } = req.body;

	if (!lendingLibraryGameId) {
		return res
			.status(400)
			.json({ message: "lendingLibraryGameId is required." });
	}

	try {
		const lendingLibraryGame = await LendingLibraryGame.findById(
			lendingLibraryGameId
		);
		if (!lendingLibraryGame) {
			return res.status(404).json({ message: "LendingLibraryGame not found" });
		}

		const requestedBy = req.user._id;

		const newGameRequest = new GameRequest({
			lendingLibraryGame: lendingLibraryGame._id,
			wantedBy: requestedBy,
			status: "requested",
			messages: [],
		});

		await newGameRequest.save();
		lendingLibraryGame.requests.push(requestedBy);
		await lendingLibraryGame.save();

		res.status(201).json({
			message: "Game request created successfully.",
			requestedGame: newGameRequest,
		});
	} catch (error) {
		console.error("Error creating game request:", error);
		res.status(500).json({ message: "Error creating game request." });
	}
});

// MARK GAME UNAVAILABLE
router.patch(
	"/mark-unavailable/:gameId",
	checkAuthentication,
	async (req, res) => {
		const { gameId } = req.params;

		try {
			const userId = req.user._id;
			const updatedGame = await LendingLibraryGame.findOneAndUpdate(
				{ _id: gameId, owner: userId },
				{ isAvailable: false },
				{ new: true }
			).populate("game", "title");

			if (!updatedGame) {
				return res.status(404).json({
					message:
						"Game not found or user not authorized to update availability.",
				});
			}

			res.json(updatedGame);
		} catch (error) {
			console.error("Error marking game as unavailable:", error);
			res
				.status(500)
				.json({ message: "Failed to mark the game as unavailable." });
		}
	}
);

// MARK GAME AVAILABLE
router.patch(
	"/mark-available/:gameId",
	checkAuthentication,
	async (req, res) => {
		const { gameId } = req.params;

		try {
			const userId = req.user._id;
			const updatedGame = await LendingLibraryGame.findOneAndUpdate(
				{ _id: gameId, owner: userId },
				{ isAvailable: true },
				{ new: true }
			).populate("game", "title");

			if (!updatedGame) {
				return res.status(404).json({
					message:
						"Game not found or user not authorized to update availability.",
				});
			}

			res.json(updatedGame);
		} catch (error) {
			console.error("Error marking game as available:", error);
			res
				.status(500)
				.json({ message: "Failed to mark the game as available." });
		}
	}
);

// EXPORT ROUTER
module.exports = router;
