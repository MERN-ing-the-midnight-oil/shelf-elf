const axios = require("axios");
const xml2js = require("xml2js");

async function fetchGameImage(gameId) {
	const url = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`;

	try {
		const response = await axios.get(url);
		const parser = new xml2js.Parser();

		parser.parseString(response.data, (err, result) => {
			if (err) {
				console.error("Error parsing XML:", err);
				return;
			}

			const imageUrl = result.items.item[0].image[0];
			console.log("Game Image URL:", imageUrl);
		});
	} catch (error) {
		console.error("Error fetching game data:", error);
	}
}

// Example usage with a known BGG game ID
// fetchGameImage("YOUR_GAME_ID_HERE"); // Replace 'YOUR_GAME_ID_HERE' with an actual game ID
fetchGameImage("113853"); // Replace 'YOUR_GAME_ID_HERE' with an actual game ID
