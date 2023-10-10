// routes for handling book-related requests
// Importing necessary modules
const express = require("express");
const Book = require("../../models/book"); // adjusted the path to go up two levels, then into models
const router = express.Router();

// Routes
router.get("/", (req, res) => {
	// Here you'd normally fetch books from your database
	res.json(books);
});

// for adding a book to a lending library
router.post("/add", async (req, res) => {
	console.log("Received data:", req.body); // Log received data
	try {
		const book = new Book(req.body); // Create a new book with the data from the request body
		await book.save(); // Save the book to the database
		res.status(201).send(book); // Respond with the created book
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(400).send(error); // Respond with error if something goes wrong
	}
});

// Exporting the router to be used in the main server file
module.exports = router;
