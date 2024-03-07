// utilities/fetchGameThumbnail.js
const axios = require("axios");
const xml2js = require("xml2js");

async function fetchGameImage(gameId) {
	const url = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`;
	try {
		const response = await axios.get(url);
		const parser = new xml2js.Parser();
		let thumbnailUrl;

		const result = await parser.parseStringPromise(response.data);
		thumbnailUrl = result.items.item[0].thumbnail[0];
		return thumbnailUrl; // Return the thumbnail URL
	} catch (error) {
		console.error("Error fetching game data:", error);
		throw error; // Throw error to be handled by the caller
	}
}

module.exports = fetchGameImage;
