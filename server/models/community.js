const mongoose = require("mongoose");

const CommunitySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: true,
	},
	members: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	passcode: {
		type: String,
		required: true,
	},
	creatorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User", // Reference to the User model
		required: true, // Ensure every community has a creator
	},
});

module.exports = mongoose.model("Community", CommunitySchema);
