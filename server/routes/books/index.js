// routes for handling book-related requests
const express = require("express");
const Book = require("../../models/book");
const router = express.Router();
const { checkAuthentication } = require("../../../middlewares/authentication"); // Import the middleware

// Offer a book for lending
router.post("/add", checkAuthentication, async (req, res) => {
	console.log("Received request to add book to lending library");
	try {
		// Extract the relevant book data from the request
		const { title, description, author } = req.body;

		const newBook = new Book({
			title,
			description,
			author,
			owner: req.user._id, // assuming req.user contains the authenticated user data
		});

		await newBook.save();
		res.status(201).json(newBook);
	} catch (error) {
		console.error("Error when offering the book:", error); // Add this line
		res.status(500).json({ error: "Error offering the book." });
	}
});

// Delete a book offer
router.delete(
	"/delete-offer/:bookId",
	checkAuthentication,
	async (req, res) => {
		try {
			const bookToDelete = await Book.findOne({
				_id: req.params.bookId,
				owner: req.user._id,
			});
			if (!bookToDelete) {
				return res
					.status(403)
					.json({ error: "You cannot delete a book you did not offer." });
			}

			await Book.findByIdAndRemove(req.params.bookId);
			res.status(200).json({ message: "Book offer removed successfully." });
		} catch (error) {
			res.status(500).json({ error: "Error removing book offer." });
		}
	}
);
// Display the logged-in user's lending library
router.get("/my-library", checkAuthentication, async (req, res) => {
	// Log when route is accessed
	console.log("Accessed /books/my-library route");

	// Check if req.user exists
	if (!req.user) {
		console.error("User not authenticated or user object not populated.");
		return res.status(401).json({ error: "User not authenticated." });
	}

	try {
		// Log the user details to check if the user info is being correctly retrieved
		console.log("Logged-in User ID:", req.user._id);

		// Find all books owned by the logged-in user
		const myBooks = await Book.find({ owner: req.user._id });

		// Log the found books
		console.log("Fetched books:", myBooks);

		res.status(200).json(myBooks);
	} catch (error) {
		// Log the error for debugging purposes
		console.error("Error fetching user's lending library:", error);

		res.status(500).json({ error: "Error fetching your lending library." });
	}
});

// Borrow a book
router.post("/borrow/:bookId", checkAuthentication, async (req, res) => {
	try {
		// Fetch the book to borrow using its ID
		const bookToBorrow = await Book.findById(req.params.bookId);

		if (!bookToBorrow) {
			return res.status(404).json({ error: "Book not found." });
		}

		// Add the book to the user's list of borrowed books and save the user
		req.user.borrowedBooks.push(bookToBorrow);
		await req.user.save();

		res.status(200).json({ message: "Book borrowed successfully." });
	} catch (error) {
		res.status(500).json({ error: "Error borrowing the book." });
	}
});
// Display all books offered by other users
router.get("/offeredByOthers", checkAuthentication, async (req, res) => {
	console.log("Fetching books offered by others...");
	try {
		console.log("Authenticated user ID:", req.user._id);
		const otherUsersBooks = await Book.find({ owner: { $ne: req.user._id } });
		console.log("Found books:", otherUsersBooks);
		res.status(200).json(otherUsersBooks);
	} catch (error) {
		console.error("Detailed error:", error); // log the actual error for debugging
		res.status(500).json({ error: "Error fetching books from other users." });
	}
});

// Return a borrowed book
router.post("/return/:bookId", checkAuthentication, async (req, res) => {
	try {
		const bookIndex = req.user.borrowedBooks.findIndex(
			(b) => b._id.toString() === req.params.bookId
		);
		if (bookIndex > -1) {
			req.user.borrowedBooks.splice(bookIndex, 1);
			await req.user.save();
			res.status(200).json({ message: "Book returned successfully." });
		} else {
			res.status(404).json({ error: "Book not found in your borrowed list." });
		}
	} catch (error) {
		res.status(500).json({ error: "Error returning the book." });
	}
});

router.patch("/request/:bookId", checkAuthentication, async (req, res) => {
	try {
		// Log the user object to verify its structure
		console.log("Authenticated user object:", req.user);

		// Fetch the book to be requested using its ID
		const bookToRequest = await Book.findById(req.params.bookId);
		if (!bookToRequest) {
			console.log("Book not found with ID:", req.params.bookId);
			return res.status(404).json({ error: "Book not found." });
		}

		// Log the current state of 'requestedBy' for this book
		console.log("Current state of requestedBy:", bookToRequest.requestedBy);

		// Check if the book is already requested by the user
		const isAlreadyRequested = bookToRequest.requestedBy.some(
			(request) => request.userId.toString() === req.user._id.toString()
		);

		if (isAlreadyRequested) {
			console.log("User has already requested this book");
			return res
				.status(400)
				.json({ error: "You've already requested this book." });
		}
		console.log(
			"the username we're about to push to requested by is: " +
				req.user.username
		);
		// Add the user's details to the `requestedBy` array and save the book
		bookToRequest.requestedBy.push({
			userId: req.user._id,
			username: req.user.username, // Assuming the username is on the req.user object
		});

		// Log the updated state of 'requestedBy' before saving
		console.log("Updated state of requestedBy:", bookToRequest.requestedBy);

		await bookToRequest.save();
		console.log("Book saved successfully");

		res.status(200).json({ message: "The Book was requested successfully." });
	} catch (error) {
		console.error("Error when requesting the book:", error);
		res.status(500).json({ error: "Error requesting the book." });
	}
});

module.exports = router;
