const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Game = require("./server/models/Game");

// MongoDB connection
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/others-covers-database";
mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
	socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
});

let currentRow = 0;
const startFromRow = 147822; // Update this number based on the last successful batch or visible record count

const batch = [];
const batchSize = 1000; // Adjust based on your observation of what your environment can handle

// Helper function to process and save a batch
const processBatch = async (batch) => {
	try {
		await Game.bulkWrite(
			batch.map((gameData) => ({
				updateOne: {
					filter: { bggId: gameData.bggId },
					update: gameData,
					upsert: true,
				},
			}))
		);
		console.log("Batch saved");
	} catch (error) {
		console.error("Error saving batch to database:", error);
	}
};

// Read and parse the CSV file
fs.createReadStream("../public/boardgames_ranks.csv")
	.pipe(csv())
	.on("data", async (row) => {
		if (currentRow++ < startFromRow) return; // Skip rows until reaching the startFromRow

		const gameData = {
			bggId: row.id,
			title: row.name,
			bggRating: row.bayesaverage,
			bggLink: `https://boardgamegeek.com/boardgame/${row.id}`,
		};

		batch.push(gameData);

		if (batch.length >= batchSize) {
			await processBatch(batch.splice(0, batchSize)); // Process the current batch and empty it
		}
	})
	.on("end", async () => {
		if (batch.length > 0) {
			await processBatch(batch); // Process any remaining records in the batch
		}
		console.log("CSV file successfully processed");
		mongoose.disconnect(); // Disconnect from MongoDB after processing
	});
