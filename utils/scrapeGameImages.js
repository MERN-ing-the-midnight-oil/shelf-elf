const axios = require("axios");
const cheerio = require("cheerio"); // Assuming you're using Cheerio for scraping

async function scrapeImageURL(gameID) {
	try {
		// Construct the URL to scrape
		const url = `https://boardgamegeek.com/boardgame/${gameID}`;
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);

		// Scrape the image URL (update the selector as per actual DOM structure)
		const imageUrl = $(".game-header-image img").attr("src");
		return imageUrl;
	} catch (error) {
		console.error("Error during web scraping:", error);
		throw error; // Or return a default image URL
	}
}

module.exports = { scrapeImageURL };
