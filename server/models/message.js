const mongoose = require("mongoose");

// Message Schema
const messageSchema = new mongoose.Schema({
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	receiver: {
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
	read: {
		type: Boolean,
		default: false,
	},
});

// Compile model from schema
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
