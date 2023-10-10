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
		required: true, // Consider encrypting
	},
	lendingLibrary: [Book.schema], // Embedding the Book schema
	borrowedBooks: [Book.schema], // Array of borrowed books
});

module.exports = mongoose.model("User", UserSchema);
