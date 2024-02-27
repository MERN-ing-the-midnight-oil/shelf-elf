const express = require("express");
const Game = require("../../models/game");

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

// Export the router
module.exports = router;
