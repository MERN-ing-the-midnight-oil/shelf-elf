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
		// Perform a text search on the 'title' field using the text index
		const games = await Game.find(
			{
				$text: {
					$search: title,
					$caseSensitive: false,
					$diacriticSensitive: false,
				},
			},
			{
				// Project the textScore to sort by relevance
				score: { $meta: "textScore" },
			}
		).sort({
			score: { $meta: "textScore" }, // Sort by relevance based on textScore
		});

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
router.post("/lend", checkAuthentication, async (req, res) => {
	const userId = req.user._id;
	const gameId = req.body.gameId; // Assuming you're sending just the game ID now

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if the game is already in the user's lending library
		const isAlreadyAdded = user.lendingLibraryGames.some((game) =>
			game.equals(gameId)
		);
		if (isAlreadyAdded) {
			return res
				.status(400)
				.json({ message: "Game already added to lending library" });
		}

		// If not already added, push the game ID and save the user
		user.lendingLibraryGames.push(gameId);
		await user.save();

		res.status(200).json(user.lendingLibraryGames);
	} catch (error) {
		console.error("Error adding game to lending library:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Route to remove a game from the user's lending library
router.delete("/remove-game/:gameId", checkAuthentication, async (req, res) => {
	try {
		const userId = req.user._id;
		const gameId = req.params.gameId;

		// Find the user and remove the gameId from their lendingLibraryGames array
		const user = await User.findByIdAndUpdate(
			userId,
			{ $pull: { lendingLibraryGames: gameId } },
			{ new: true } // Return the updated document
		).populate("lendingLibraryGames"); // Optionally populate the lendingLibraryGames field to return updated list

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({
			message: "Game removed from lending library successfully.",
			lendingLibraryGames: user.lendingLibraryGames,
		});
	} catch (error) {
		console.error("Error removing game from lending library:", error);
		res
			.status(500)
			.json({ message: "Error removing game from lending library" });
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
