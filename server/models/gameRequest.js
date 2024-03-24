const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	messageText: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const gameRequestSchema = new mongoose.Schema({
	lendingLibraryGame: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "LendingLibraryGame",
		required: true,
	},
	wantedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	messages: [messageSchema], //maybe delete?
	status: {
		type: String,
		enum: [
			"requested",
			"accepted",
			"declined",
			"borrowed",
			"returned",
			"rescinded",
		],
		default: "requested",
	},
});

const GameRequest = mongoose.model("GameRequest", gameRequestSchema);
module.exports = GameRequest;
