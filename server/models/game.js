const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	bggRating: {
		type: Number,
		required: true,
	},
	bggId: {
		type: Number,
		required: true,
		unique: true,
	},
	bggLink: {
		type: String,
		required: true,
	},
	thumbnailUrl: {
		// Add this field
		type: String,
		required: false, // Make this optional as you might not have an image for every game initially
	},
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
