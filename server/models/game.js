const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	bggRating: {
		type: Number,
		required: false,
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
		type: String,
		required: false,
	},
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
