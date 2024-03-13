const mongoose = require("mongoose");

const lendingLibraryGameSchema = new mongoose.Schema({
	game: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Game",
		required: true,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	requests: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	promisedTo: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		default: null,
	},
	isAvailable: {
		type: Boolean,
		default: true,
	},
});

const LendingLibraryGame = mongoose.model(
	"LendingLibraryGame",
	lendingLibraryGameSchema
);
module.exports = LendingLibraryGame;
