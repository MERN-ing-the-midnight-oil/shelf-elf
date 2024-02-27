// Import necessary modules
const express = require("express");
const Game = require("../../models/game"); // Ensure you have a Game model similar to the Book model

const router = express.Router();

// Route to get the first ten games from the database
router.get("/top-ten", async (req, res) => {
	try {
		// Fetch the first ten games from the database
		const games = await Game.find({}).limit(10);
		res.status(200).json(games);
	} catch (error) {
		console.error("Failed to fetch games:", error);
		res.status(500).json({ error: "Error fetching games." });
	}
});

// Export the router
module.exports = router;
