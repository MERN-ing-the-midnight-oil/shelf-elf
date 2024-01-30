const mongoose = require("mongoose");
const Book = require("./book");

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	street1: {
		type: String,
		required: true,
	},
	street2: {
		type: String,
		required: true,
	},
	zipCode: {
		type: String,
		required: true,
		match: [/^[0-9]{5}$/, "Invalid zip code"],
	},
	lendingLibrary: [Book.schema],
	borrowedBooks: [Book.schema],
	requestedBooks: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Book",
		},
	],
	communities: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Community",
		},
	],
});

module.exports = mongoose.model("User", UserSchema);
