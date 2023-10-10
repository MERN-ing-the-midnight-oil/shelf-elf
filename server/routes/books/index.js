//routes for handlig book related requests
// Importing necessary modules
const express = require("express");
const router = express.Router();

// Dummy Data (For testing purposes)
const books = [
	{ id: 1, title: "Book Title 1", author: "Author 1" },
	{ id: 2, title: "Book Title 2", author: "Author 2" },
];

// Routes
router.get("/", (req, res) => {
	// Here you'd normally fetch books from your database
	res.json(books);
});

//for adding a book to a lending library
router.post("/add", async (req, res) => {
	try {
		const book = new Book(req.body); // Create a new book with the data from the request body
		await book.save(); // Save the book to the database
		res.status(201).send(book); // Respond with the created book
	} catch (error) {
		res.status(400).send(error); // Respond with error if something goes wrong
	}
});

// Exporting the router to be used in the main server file
module.exports = router;
