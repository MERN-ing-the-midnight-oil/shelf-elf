const axios = require("axios");
const xml2js = require("xml2js");
const Game = require("../../models/game"); // Ensure the Game model path is correct

/**
 * Fetch the thumbnail URL for a game from BoardGameGeek API and update the database.
 * @param {number} bggId - The BoardGameGeek ID of the game.
 * @returns {Promise<string | null>} The thumbnail URL or null if not found.
 */
async function fetchGameImage(bggId) {
	const url = `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1`;
	console.log(`Fetching game image for BGG ID: ${bggId} from URL: ${url}`);

	try {
		// Fetch the XML response from the BGG API
		const response = await axios.get(url);
		console.log(`Received response from BGG for game ID ${bggId}.`);

		// Parse the XML data
		const parser = new xml2js.Parser();
		const parsedData = await parser.parseStringPromise(response.data);
		console.log(
			`Parsed XML for game ID ${bggId}:`,
			JSON.stringify(parsedData, null, 2)
		);

		// Extract the thumbnail URL
		const thumbnailUrl = parsedData?.items?.item?.[0]?.thumbnail?.[0];
		if (!thumbnailUrl) {
			console.warn(`No thumbnail found for BGG ID: ${bggId}`);
			return null;
		}

		console.log(`Thumbnail URL found for BGG ID ${bggId}: ${thumbnailUrl}`);

		// Update the database with the new thumbnail URL
		const game = await Game.findOneAndUpdate(
			{ bggId }, // Find the game by BGG ID
			{ thumbnailUrl }, // Update the thumbnail URL
			{ new: true, upsert: false } // Update only if it exists, no upsert
		);

		if (game) {
			console.log(`Updated game thumbnail in database for BGG ID ${bggId}.`);
		} else {
			console.log(`Game with BGG ID ${bggId} not found in the database.`);
		}

		return thumbnailUrl;
	} catch (error) {
		console.error(
			`Error fetching or updating game image for BGG ID ${bggId}:`,
			error
		);
		return null;
	}
}

module.exports = fetchGameImage;
