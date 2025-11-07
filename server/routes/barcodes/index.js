const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/lookup", async (req, res) => {
	const { barcode } = req.query;
	if (!barcode) {
		return res.status(400).json({ error: "Barcode is required" });
	}

	const apiKey = process.env.BARCODE_LOOKUP_API_KEY;
	const rapidApiUrl = `https://barcodes-lookup.p.rapidapi.com/?query=${barcode}`;
	const gameUpcUrl = `https://api.gameupc.com/test/upc/${barcode}`;
	
	let rapidApiTried = false;

	try {
		// Try RapidAPI Barcodes Lookup first
		rapidApiTried = true;
		const rapidResponse = await axios.get(rapidApiUrl, {
			headers: {
				"x-rapidapi-host": "barcodes-lookup.p.rapidapi.com",
				"x-rapidapi-key": apiKey,
			},
		});

		console.log("RapidAPI Response:", rapidResponse.data);

		const title = rapidResponse.data.product?.title;
		if (title) {
			return res.json({ title });
		}

		// If RapidAPI didn't find a title, fall back to GameUPC
		console.log("No title from RapidAPI, trying GameUPC fallback...");
		
		const gameUpcResponse = await axios.get(gameUpcUrl);
		console.log("GameUPC Response:", gameUpcResponse.data);

		if (gameUpcResponse.data.status === "ok" && gameUpcResponse.data.name) {
			return res.json({ title: gameUpcResponse.data.name });
		}

		// Neither API found a result
		console.warn("No title found in either API");
		res.status(404).json({ error: "Product not found" });
	} catch (error) {
		// If RapidAPI failed, try GameUPC as fallback
		if (rapidApiTried) {
			try {
				console.log("RapidAPI error, trying GameUPC fallback...");
				const gameUpcResponse = await axios.get(gameUpcUrl);
				console.log("GameUPC Response:", gameUpcResponse.data);

				if (gameUpcResponse.data.status === "ok" && gameUpcResponse.data.name) {
					return res.json({ title: gameUpcResponse.data.name });
				}
			} catch (fallbackError) {
				console.error("GameUPC fallback also failed:", fallbackError.message);
			}
		}

		console.error("Error fetching barcode info:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
