const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const { checkAuthentication } = require("../../../middlewares/authentication");
const { parseStringPromise } = require("xml2js"); // ✅ Direct import
const fetchGameImage = require("./fetchGameImage"); // ✅ No duplicate
const User = require("../../models/user");
const Community = require("../../models/community");
const GameRequest = require("../../models/gameRequest");
const Game = require("../../models/game");
const LendingLibraryGame = require("../../models/lendingLibraryGame");

router.post("/lend", checkAuthentication, async (req, res) => {
	console.log("📌 Lend route called with body:", req.body);

	const userId = req.user._id;
	const { gameId } = req.body;

	if (!gameId) {
		console.error("⛔ Missing gameId in request body.");
		return res.status(400).json({ message: "gameId is required." });
	}

	try {
		let game;

		// Validate and fetch game based on gameId
		if (mongoose.Types.ObjectId.isValid(gameId)) {
			console.log("🔍 gameId is a valid ObjectId:", gameId);
			game = await Game.findById(gameId);
		} else if (!isNaN(gameId)) {
			console.log("🔍 gameId is a valid bggId (number-based):", gameId);
			game = await Game.findOne({ bggId: parseInt(gameId, 10) });

			// If game isn't found locally, fetch from BGG API
			if (!game) {
				console.log("🌍 Game not found locally. Fetching from BGG API...");
				const bggApiUrl = `https://api.geekdo.com/xmlapi/boardgame/${gameId}?stats=1`;

				try {
					const response = await axios.get(bggApiUrl, {
						headers: { Accept: "application/xml" },
					});
					const xmlData = response.data;
					console.log("📜 Raw XML response from BGG:", xmlData);

					// Convert XML to JSON
					const { parseStringPromise } = require("xml2js");
					const jsonResult = await parseStringPromise(xmlData);
					const bggGame = jsonResult.boardgames.boardgame?.[0];

					if (!bggGame) {
						throw new Error("Invalid API response structure");
					}

					const newGameData = {
						bggId: parseInt(bggGame.$.objectid, 10),
						title: bggGame.name[0]._ || "Unknown Title",
						bggLink: `https://boardgamegeek.com/boardgame/${bggGame.$.objectid}`,
						bggRating: isNaN(
							bggGame.statistics?.[0]?.ratings?.[0]?.average?.[0]?._
						)
							? null
							: parseFloat(
									bggGame.statistics?.[0]?.ratings?.[0]?.average?.[0]?._
							  ),
					};

					// ✅ Fetch the game image separately
					const thumbnailUrl = await fetchGameImage(newGameData.bggId);
					newGameData.thumbnailUrl = thumbnailUrl || null;

					console.log("✅ Extracted game data from BGG:", newGameData);

					// Save new game to database
					game = new Game(newGameData);
					await game.save();
					console.log(`✅ New game saved to database: ${game._id}`);
				} catch (apiError) {
					console.error(
						"🔥 Error fetching game from BGG API:",
						apiError.message
					);
					return res.status(500).json({
						message: "Failed to retrieve game data from BoardGameGeek.",
					});
				}
			}
		} else {
			console.error("⛔ Invalid gameId format:", gameId);
			return res.status(400).json({ message: "Invalid gameId format." });
		}

		if (!game) {
			console.error("⛔ Game not found for gameId:", gameId);
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
			`✅ Game ${game._id} added to lending library for user ${userId}.`
		);

		res.status(200).json({
			message: "Game added to lending library successfully.",
			lendingLibraryGame: newLendingLibraryGame,
		});
	} catch (error) {
		console.error("🔥 Error in lend route:", error);
		res.status(500).json({ message: "Error adding game to lending library." });
	}
});

// SEARCH ROUTE
router.get("/search", async (req, res) => {
	try {
		const { query } = req.query;
		if (!query) {
			return res.status(400).json({ message: "Query parameter is required." });
		}

		console.log(`🔎 Searching for games with query: "${query}"`);

		// ✅ STEP 1: Search MongoDB for Matching Titles
		let localGames = await Game.find({
			title: { $regex: query, $options: "i" },
		});

		let localGameIDs = localGames.map((g) => g.bggId);
		console.log("🗂️ Found locally stored game IDs:", localGameIDs);

		// ✅ STEP 2: Fetch From BGG If Some Titles Are Missing
		console.log("🌍 Checking if additional games exist on BGG...");

		const bggApiUrl = `https://boardgamegeek.com/xmlapi/search?search=${encodeURIComponent(
			query
		)}`;
		try {
			const response = await axios.get(bggApiUrl, {
				headers: { Accept: "application/xml" },
			});
			const xmlData = response.data;
			const { parseStringPromise } = require("xml2js");
			const jsonResult = await parseStringPromise(xmlData);

			let bggGames = jsonResult.boardgames?.boardgame?.slice(0, 10) || [];
			if (bggGames.length === 0) {
				console.log("❌ No additional games found on BGG.");
			} else {
				const fetchedGameIDs = bggGames.map((bggGame) =>
					parseInt(bggGame.$.objectid, 10)
				);
				console.log("🎲 BGG API returned game IDs:", fetchedGameIDs);

				// ✅ STEP 3: Filter Out Games Already in MongoDB
				const newGames = bggGames.filter(
					(bggGame) => !localGameIDs.includes(parseInt(bggGame.$.objectid, 10))
				);

				// ✅ STEP 4: Save New Games to MongoDB
				for (const bggGame of newGames) {
					const bggId = parseInt(bggGame.$.objectid, 10);
					const title = bggGame.name?.[0]?._ || "Unknown Title";
					const bggLink = `https://boardgamegeek.com/boardgame/${bggId}`;
					const thumbnailUrl = await fetchGameImage(bggId);

					console.log(`🆕 Saving new game: ${title} (ID: ${bggId})`);
					await Game.create({ title, bggId, bggLink, thumbnailUrl });
				}

				// ✅ STEP 5: Query MongoDB Again to Get Updated Results
				localGames = await Game.find({
					title: { $regex: query, $options: "i" },
				});
			}

			console.log(
				"🚀 Final list of game IDs sent to frontend:",
				localGames.map((g) => g.bggId)
			);
			return res.json(localGames);
		} catch (apiError) {
			console.error("🔥 Error fetching search results from BGG API:", apiError);
			return res
				.status(500)
				.json({ message: "Failed to retrieve search results from BGG." });
		}
	} catch (error) {
		console.error("🔥 Error in search route:", error);
		res.status(500).json({ message: "Error searching for games." });
	}
});

// ADD GAME TO USER LIBRARY

// ADD GAME TO USER LIBRARY

// ADD GAME TO USER LIBRARY

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
const transporter = require("../route_utils/emailTransporter");
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
		)
			.populate("owner", "email username") // Fetch owner's email and username
			.populate("game", "title"); // Fetch game title

		if (!lendingLibraryGame) {
			return res.status(404).json({ message: "LendingLibraryGame not found" });
		}

		const requestedBy = req.user._id;
		const requestingUser = req.user.username;

		// Create a new GameRequest document
		const newGameRequest = new GameRequest({
			lendingLibraryGame: lendingLibraryGame._id,
			wantedBy: requestedBy,
			status: "requested",
			messages: [],
		});

		await newGameRequest.save();
		lendingLibraryGame.requests.push(requestedBy);
		await lendingLibraryGame.save();

		// Email the owner about the request
		const mailOptions = {
			from: `"Game Lender Notifications" <${process.env.EMAIL_USER}>`,
			to: lendingLibraryGame.owner.email, // Owner's email
			subject: "New Game Request on Game Lender",
			text: `Hello ${lendingLibraryGame.owner.username},
		
		User "${requestingUser}" has requested to borrow your game: "${lendingLibraryGame.game.title}".
	
		
		Please let ${requestingUser} know if it's still available by visiting your account at: https://bit.ly/GameLender, 
		
		Thanks,  
		Game Lender Team`,
		};

		// Send email
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				console.error("Error sending email:", err);
			} else {
				console.log("Email sent:", info.response);
			}
		});

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
// Fetch games requested by the authenticated user
router.get("/my-requested-games", checkAuthentication, async (req, res) => {
	const userId = req.user._id; // Get the logged-in user ID
	console.log(`Fetching requested games for user ID: ${userId}`);

	try {
		const gameRequests = await GameRequest.find({ wantedBy: userId })
			.populate({
				path: "lendingLibraryGame",
				populate: {
					path: "game", // Populate game details
					select: "title bggLink thumbnailUrl", // Select necessary fields
				},
			})
			.populate({
				path: "lendingLibraryGame",
				populate: {
					path: "owner",
					select: "username", // Populate owner details
				},
			});

		console.log("Requested games fetched:", gameRequests);
		res.json(gameRequests);
	} catch (error) {
		console.error("Error fetching requested games:", error);
		res.status(500).json({ message: "Error fetching requested games" });
	}
});

router.get("/gamesFromMyCommunities", checkAuthentication, async (req, res) => {
	const userId = req.user._id;
	try {
		// Fetch user's communities
		const userCommunities = await Community.find({ members: userId }).select(
			"_id name members"
		);
		console.log("User communities fetched:", userCommunities);

		// Collect all member IDs from the user's communities
		const communityMemberIds = userCommunities.flatMap(
			(community) => community.members
		);
		console.log("Community member IDs:", communityMemberIds);

		// Fetch games where the owner is a member of these communities
		const games = await LendingLibraryGame.find({
			owner: { $in: communityMemberIds },
		})
			.populate("game", "title bggLink thumbnailUrl")
			.populate("owner", "username");
		console.log("Games fetched:", games);

		// Transform the response for the front end
		const transformedGames = games.map((entry) => ({
			gameIdentification: entry._id,
			gameTitle: entry.game.title,
			bggLink: entry.game.bggLink,
			thumbnailUrl: entry.game.thumbnailUrl,
			ownerUsername: entry.owner.username,
			isAvailable: entry.isAvailable,
		}));

		res.status(200).json(transformedGames);
	} catch (error) {
		console.error("Error fetching games from communities:", error);
		res.status(500).json({ message: "Error fetching games from communities." });
	}
});
router.patch(
	"/rescind-game-request/:requestId",
	checkAuthentication,
	async (req, res) => {
		try {
			const { requestId } = req.params;
			const userId = req.user._id; // Your routes use `_id`

			console.log(`Rescinding request ID: ${requestId} by user ${userId}`);

			// Find the game request
			const gameRequest = await GameRequest.findById(requestId);
			if (!gameRequest) {
				return res.status(404).json({ message: "Game request not found." });
			}

			// Ensure the user owns the request
			if (gameRequest.wantedBy.toString() !== userId.toString()) {
				return res
					.status(403)
					.json({ message: "Unauthorized to rescind this request." });
			}

			// Update status to "rescinded"
			gameRequest.status = "rescinded";
			await gameRequest.save();

			console.log(`Game request ${requestId} successfully rescinded.`);
			return res
				.status(200)
				.json({ message: "Game request rescinded successfully." });
		} catch (error) {
			console.error("Error rescinding game request:", error);
			return res.status(500).json({ message: "Internal server error." });
		}
	}
);

// EXPORT ROUTER
module.exports = router;
