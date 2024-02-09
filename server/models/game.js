const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	bggRating: {
		// Board Game Geek Rating
		type: Number,
		required: false,
	},
	bggId: {
		// Board Game Geek ID
		type: String,
		required: false,
	},
	// Add any other relevant fields here
});

module.exports = mongoose.model("Game", GameSchema);
