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

const requestedGameSchema = new mongoose.Schema({
	game: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Game",
		required: true,
	},
	offeredBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	wantedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	messages: [messageSchema],
	status: {
		type: String,
		enum: ["requested", "accepted", "declined", "borrowed", "returned"],
		default: "requested",
	},
});

const RequestedGame = mongoose.model("RequestedGame", requestedGameSchema);
module.exports = RequestedGame;
