const mongoose = require("mongoose");
const Book = require("./book");

// Define lendingLibraryGameSchema before UserSchema since it's embedded
const lendingLibraryGameSchema = new mongoose.Schema({
	game: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Game",
		required: true,
	},
	offeredBy: {
		// This can actually be omitted because the game is embedded in the user document
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: false,
	},
	requests: [
		{
			// List of users who requested the game
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	promisedTo: {
		// The user to whom the game is promised, if any
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		default: null,
	},
});

// Now define UserSchema including the lendingLibraryGames
const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	lendingLibrary: [Book.schema],
	borrowedBooks: [Book.schema],
	requestedBooks: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Book",
		},
	],
	requestedGames: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Game",
		},
	],
	communities: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Community",
		},
	],
	lendingLibraryGames: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "LendingLibraryGame",
		},
	],
});

module.exports = mongoose.model("User", UserSchema);
