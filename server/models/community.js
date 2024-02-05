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
});

module.exports = mongoose.model("Community", CommunitySchema);
