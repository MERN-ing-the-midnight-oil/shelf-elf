const mongoose = require("mongoose");
const Book = require("./book");

const UserSchema = new mongoose.Schema({
	username: String,
	email: String,
	password: String, // Consider encrypting
	lendingLibrary: [Book.schema], // Embedding the Book schema
});

module.exports = mongoose.model("User", UserSchema);
