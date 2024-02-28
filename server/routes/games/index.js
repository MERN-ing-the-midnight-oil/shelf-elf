const express = require("express");
const Game = require("../../models/game");
const auth = require("../../../middlewares/authentication");
const User = require("../../models/user"); // Your User model
const router = express.Router();

// Search for games
router.get("/search", async (req, res) => {
	// Extract search query from URL query parameters
	const { title } = req.query;

	if (!title) {
		return res.status(400).json({ message: "No search term provided" });
	}

	try {
		// Use a regex for case-insensitive and partial match search
		const searchRegex = new RegExp(title, "i");
		const games = await Game.find({ title: searchRegex });

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
//add a game to the user's library
// POST /api/games/lend
// Requires auth middleware to ensure user is logged in
router.post("/lend", auth, async (req, res) => {
	try {
		const userId = req.user.id; // Assuming your auth middleware adds the user ID to the request
		const { game } = req.body; // The game object to add to lendingLibraryGames

		// Find the user and update their lendingLibraryGames
		const user = await User.findByIdAndUpdate(
			userId,
			{ $push: { lendingLibraryGames: game } },
			{ new: true } // Return the updated document
		);

		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		res.json(user.lendingLibraryGames); // Or just send a success message
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error");
	}
});

// Export the router
module.exports = router;
