const express = require("express");
const router = express.Router();
const axios = require("axios");

// Helper function to fetch from GameUPC API
async function fetchFromGameUpc(barcode) {
	// Validate barcode to prevent URL manipulation
	if (!/^[0-9]+$/.test(barcode)) {
		throw new Error("Invalid barcode format");
	}
	
	const gameUpcUrl = `https://api.gameupc.com/test/upc/${barcode}`;
	const response = await axios.get(gameUpcUrl);
	console.log("GameUPC Response:", response.data);
	
	if (response.data.status === "ok" && response.data.name) {
		return response.data.name;
	}
	return null;
}

router.get("/lookup", async (req, res) => {
	const { barcode } = req.query;
	if (!barcode) {
		return res.status(400).json({ error: "Barcode is required" });
	}

	// Validate barcode format to prevent injection attacks
	if (!/^[0-9]+$/.test(barcode)) {
		return res.status(400).json({ error: "Invalid barcode format" });
	}

	const apiKey = process.env.BARCODE_LOOKUP_API_KEY;
	const rapidApiUrl = `https://barcodes-lookup.p.rapidapi.com/?query=${barcode}`;
	
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
		
		const gameUpcTitle = await fetchFromGameUpc(barcode);
		if (gameUpcTitle) {
			return res.json({ title: gameUpcTitle });
		}

		// Neither API found a result
		console.warn("No title found in either API");
		res.status(404).json({ error: "Product not found" });
	} catch (error) {
		// If RapidAPI failed, try GameUPC as fallback
		if (rapidApiTried) {
			try {
				console.log("RapidAPI error, trying GameUPC fallback...");
				const gameUpcTitle = await fetchFromGameUpc(barcode);
				if (gameUpcTitle) {
					return res.json({ title: gameUpcTitle });
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
