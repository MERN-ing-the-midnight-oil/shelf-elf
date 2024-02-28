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
	console.log("Attempting to add game to user's lending library");
	try {
		const userId = req.user._id; // Make sure your auth middleware adds the user object to req
		const { game } = req.body; // The game object to add

		console.log(`User ID: ${userId}`, `Game to lend: ${game.title}`);

		// Find the user and update their lendingLibraryGames
		const user = await User.findByIdAndUpdate(
			userId,
			{ $push: { lendingLibraryGames: game } },
			{ new: true } // Option to return the updated document
		);

		if (!user) {
			console.log("User not found with ID:", userId);
			return res.status(404).json({ message: "User not found" });
		}

		console.log("Game added to lending library:", game.title);
		res.json(user.lendingLibraryGames); // Send the updated list of games as a response
	} catch (error) {
		console.error("Error adding game to lending library:", error);
		res.status(500).json({ message: "Server error" });
	}
});
// Export the router
module.exports = router;
