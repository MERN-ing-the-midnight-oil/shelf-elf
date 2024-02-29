const express = require("express");
const Game = require("../../models/game");
const { checkAuthentication } = require("../../../middlewares/authentication");
const User = require("../../models/user"); // Your User model
const router = express.Router();

// Search for games
router.get("/search", async (req, res) => {
	const { title } = req.query;

	if (!title) {
		return res.status(400).json({ message: "No search term provided" });
	}

	try {
		// Create a regex pattern to search for any of the words, ensuring they stand as separate words using word boundaries (\b)
		const words = title.trim().split(/\s+/);
		const searchRegexPattern = words.map((word) => `\\b${word}\\b`).join("|");
		const searchRegex = new RegExp(searchRegexPattern, "i");

		const games = await Game.find({ title: { $regex: searchRegex } });

		if (games.length > 0) {
			res.json(games);
		} else {
			res
				.status(404)
				.json({ message: "No games found matching the search criteria" });
		}
	} catch (error) {
		console.error("Error searching for games:", error);
		res.status(500).json({ message: "Error searching for games" });
	}
});

// Add a game to the user's library
// POST /api/games/lend

router.post("/lend", checkAuthentication, async (req, res) => {
	console.log("Received game to lend:", req.body.game); // Log the received game
	const userId = req.user._id;
	const gameId = req.body.game._id; // Assuming sending the game ID in the request

	if (!mongoose.Types.ObjectId.isValid(gameId)) {
		return res.status(400).json({ message: "Invalid game ID" });
	}

	try {
		// Check if the game exists
		const gameExists = await Game.findById(gameId);
		if (!gameExists) {
			return res.status(404).json({ message: "Game not found" });
		}

		// Add the game to the user's lending library, ensuring no duplicates
		const user = await User.findByIdAndUpdate(
			userId,
			{ $addToSet: { lendingLibraryGames: gameId } },
			{ new: true, populate: "lendingLibraryGames" } // Populate to return the updated list of games
		);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		console.log("Game added to lending library:", req.body.game.title);
		res.json(user.lendingLibraryGames);
	} catch (error) {
		console.error("Error adding game to lending library:", error);
		res.status(500).json({ message: "Server error" });
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
// Export the router
module.exports = router;
