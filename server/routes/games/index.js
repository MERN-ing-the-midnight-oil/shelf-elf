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
	console.log("🔍 Search route called with query:", req.query);
	const { title } = req.query;

	if (!title) {
		console.warn("⚠️ No title provided in search request.");
		return res.status(400).json({ message: "Title is required." });
	}

	try {
		console.log(`🔎 Searching for: "${title}" in local database...`);

		// **Step 1: Search Local Database (Text Search)**
		let games = await Game.find({
			$text: { $search: `"${title}"` },
		})
			.sort({ score: { $meta: "textScore" } })
			.limit(10);

		console.log(`✅ Found ${games.length} results from text search.`);

		// **Step 2: Fallback to Regex Search if No Text Matches**
		if (games.length === 0) {
			console.log("🔄 No exact matches. Trying regex search...");
			const regex = new RegExp(title, "i");
			games = await Game.find({ title: regex }).limit(10);
			console.log(`✅ Found ${games.length} results from regex search.`);
		}

		// **Step 3: If No Local Matches, Query BGG API**
		if (games.length === 0) {
			console.log("🌍 No local matches found. Querying BoardGameGeek API...");

			const cleanedTitleForBGG = title
				.replace(/\b(Board Game|Board|Game)\b/gi, "")
				.trim();
			console.log(`🛠️ Cleaned title for BGG API: "${cleanedTitleForBGG}"`);

			const bggUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(
				cleanedTitleForBGG
			)}&type=boardgame`;

			try {
				const bggResponse = await axios.get(bggUrl);
				console.log("📡 Received raw response from BGG API.");

				// Parse XML Response
				const parsedData = await xml2js.parseStringPromise(bggResponse.data, {
					mergeAttrs: true,
				});
				const bggGames = parsedData.items?.item || [];
				console.log(`✅ Parsed ${bggGames.length} games from BGG API.`);

				// Process BGG Results
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

							console.log(`🖼️ Fetching image for BGG ID: ${bggId}...`);
							const thumbnailUrl = await fetchGameImage(bggId).catch((err) => {
								console.error(
									`❌ Error fetching image for BGG ID ${bggId}:`,
									err
								);
								return null;
							});

							console.log(
								`🎨 Image fetched for BGG ID ${bggId}: ${
									thumbnailUrl || "No Image Found"
								}`
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

				console.log("🛠️ Final BGG Games:", games);
			} catch (error) {
				console.error("❌ Error querying BGG API:", error);
			}
		}

		// **Step 4: Ensure Games Have Images**
		for (const game of games) {
			if (!game.thumbnailUrl) {
				console.log(
					`🚨 No thumbnail found for "${game.title}" (BGG ID: ${game.bggId}). Fetching from BGG...`
				);
				game.thumbnailUrl = await fetchGameImage(game.bggId);
				console.log(
					`✅ Updated thumbnail for "${game.title}": ${
						game.thumbnailUrl || "No Image Found"
					}`
				);
			}
		}

		// **Return Final Games List**
		console.log(`📦 Returning ${games.length} games.`);
		res.json(games);
	} catch (error) {
		console.error("❌ Error during search:", error);
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
