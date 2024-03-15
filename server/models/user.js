const mongoose = require("mongoose");
const Book = require("./book");

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
