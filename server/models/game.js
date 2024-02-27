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
		// Changed from bggUrl to bggLink
		type: String,
		required: true,
	},
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
