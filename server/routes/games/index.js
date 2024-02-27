const express = require("express");
const router = express.Router();
// const { scrapeGameImages } = require('../../utils/scrapeGameImages');
const Game = require("../../models/Game"); // Adjust the path as necessary
// const { checkAuthentication } = require('../../../middlewares/authentication');

// Route to get the first 10 games from the database
router.get("/first10", async (req, res) => {
	try {
		const games = await Game.find({}).limit(10);
		res.json(games);
	} catch (error) {
		console.error("Error fetching games:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Commented out code for future implementation
// router.post('/some-route', async (req, res) => {
//     // Code for future implementation
//     // const image = await scrapeGameImages(someParameter);
// });

module.exports = router;
