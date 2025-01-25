const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/lookup", async (req, res) => {
	const { barcode } = req.query;
	if (!barcode) {
		return res.status(400).json({ error: "Barcode is required" });
	}

	const apiKey = process.env.BARCODE_LOOKUP_API_KEY;
	const apiUrl = `https://barcodes-lookup.p.rapidapi.com/?query=${barcode}`;

	try {
		const response = await axios.get(apiUrl, {
			headers: {
				"x-rapidapi-host": "barcodes-lookup.p.rapidapi.com",
				"x-rapidapi-key": apiKey,
			},
		});

		console.log("API Response:", response.data); // Log the entire response for debugging

		const title = response.data.product?.title;
		if (title) {
			res.json({ title });
		} else {
			console.warn("No title found in API response:", response.data);
			res.status(404).json({ error: "Product not found" });
		}
	} catch (error) {
		console.error("Error fetching barcode info:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
