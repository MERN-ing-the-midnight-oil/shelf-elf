// routes for handling book-related requests
// Importing necessary modules
const express = require("express");
const Book = require("../../models/book"); // adjusted the path to go up two levels, then into models
const router = express.Router();

// Routes
router.get("/", async (req, res) => {
	try {
		const books = await Book.find(); // Query all books from the database
		res.json(books); // Respond with the fetched books
	} catch (error) {
		console.error("Error fetching books:", error); // Log detailed error information
		res.status(500).send("Internal Server Error"); // Send a 500 status code with an error message
	}
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

//for deleting a book from the lending library
router.delete("/:id", async (req, res) => {
	try {
		await Book.findByIdAndDelete(req.params.id);
		res.status(200).send("Book deleted");
	} catch (error) {
		console.error("Error deleting book:", error);
		res.status(500).send("Internal Server Error");
	}
});

// Exporting the router to be used in the main server file
module.exports = router;
