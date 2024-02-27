const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Game = require("../server/models/Game"); // Adjust path as necessary

// MongoDB connection
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/others-covers-database";
mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const batchSize = 1000; // Number of records per batch
let batch = []; // Temporary array to hold batch entries
let count = 0; // Counter to track number of processed records

// Read and parse the CSV file
fs.createReadStream("../public/boardgames_ranks.csv")
	.pipe(csv())
	.on("data", async (row) => {
		const gameData = {
			bggId: row.id,
			title: row.name,
			bggRating: row.bayesaverage, // Assuming 'bayesaverage' is the column name for BGG rating
			bggLink: `https://boardgamegeek.com/boardgame/${row.id}`,
		};

		batch.push(gameData);
		count++;

		if (batch.length === batchSize) {
			// Insert batch into the database
			await Game.insertMany(batch).catch((err) =>
				console.error("Error saving batch to database:", err)
			);
			console.log(`Batch ${Math.ceil(count / batchSize)} saved`);
			batch = []; // Reset batch
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay
		}
	})
	.on("end", async () => {
		if (batch.length > 0) {
			await Game.insertMany(batch).catch((err) =>
				console.error("Error saving final batch to database:", err)
			);
			console.log("Final batch saved");
		}
		console.log("CSV file successfully processed");
		mongoose.disconnect(); // Disconnect from MongoDB
	});
