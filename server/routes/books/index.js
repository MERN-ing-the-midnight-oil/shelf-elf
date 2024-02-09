// routes for handling book-related requests
const express = require("express");
const Book = require("../../models/book");
const User = require("../../models/user");

const router = express.Router();
const { checkAuthentication } = require("../../../middlewares/authentication"); // Import the middleware

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

		// Save the new book
		await newBook.save();

		// Add the new book's ID to the user's lendingLibrary array
		await User.updateOne(
			{ _id: req.user._id },
			{ $addToSet: { lendingLibrary: newBook } }
		);

		res.status(201).json(newBook);
	} catch (error) {
		console.error("Error when offering the book:", error);
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
	// console.log("Accessed /books/my-library route");

	// Check if req.user exists
	if (!req.user) {
		console.error("User not authenticated or user object not populated.");
		return res.status(401).json({ error: "User not authenticated." });
	}

	try {
		// Log the user details to check if the user info is being correctly retrieved
		// console.log("Logged-in User ID:", req.user._id);

		// Find all books owned by the logged-in user
		const myBooks = await Book.find({ owner: req.user._id });

		// Log the found books
		// console.log("Fetched books:", myBooks);

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

// Route to get books from all communities the user is a part of
router.get("/booksFromMyCommunities", checkAuthentication, async (req, res) => {
	console.log("Books from my communities Route Hit");
	try {
		// Find communities the user belongs to
		const userCommunities = await User.findById(req.user._id)
			.select("communities")
			.populate("communities");

		// Collect all user IDs from these communities
		let userIds = [];
		for (let community of userCommunities.communities) {
			const usersInCommunity = await User.find({
				communities: community._id,
			}).select("_id");
			userIds = [...userIds, ...usersInCommunity.map((user) => user._id)];
		}

		// Remove duplicates from userIds array
		userIds = [...new Set(userIds)];

		// Find books offered by these users, excluding the current user's books
		const books = await Book.find({
			owner: { $in: userIds, $ne: req.user._id },
		}).populate("owner", "username");

		res.status(200).json(books);
	} catch (error) {
		console.error("Error fetching books from user communities:", error);
		res
			.status(500)
			.json({ error: "Failed to fetch books from user communities" });
	}
});

// Route to get books offered in a specific community
router.get(
	"/offeredInCommunity/:communityId",
	checkAuthentication,
	async (req, res) => {
		try {
			const communityId = req.params.communityId;
			// Find users who are part of the community
			const usersInCommunity = await User.find({
				communities: communityId,
			}).select("_id");
			const userIds = usersInCommunity.map((user) => user._id);

			// Find books offered by these users
			const books = await Book.find({ owner: { $in: userIds } }).populate(
				"owner",
				"username"
			);
			res.status(200).json(books);
		} catch (error) {
			console.error("Error fetching books for community:", error);
			res
				.status(500)
				.json({ error: "Failed to fetch books for the community" });
		}
	}
);

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

//Request a book
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
		// Update the user's `requestedBooks` list
		await User.findByIdAndUpdate(req.user._id, {
			$push: { requestedBooks: bookToRequest._id },
		});
		//Save the updated book
		await bookToRequest.save();
		console.log("Book and user updated successfully");

		res.status(200).json({ message: "The Book was requested successfully." });
	} catch (error) {
		console.error("Error when requesting the book:", error);
		res.status(500).json({ error: "Error requesting the book." });
	}
});
// DELETE /api/books/:bookId
//deletes a book from a users list of requests
router.delete("/:bookId", checkAuthentication, async (req, res) => {
	try {
		// Log the user object to verify its structure
		console.log("Authenticated user object:", req.user);

		// Fetch the book to be unrequested using its ID
		const bookToUnrequest = await Book.findById(req.params.bookId);
		if (!bookToUnrequest) {
			console.log("Book not found with ID:", req.params.bookId);
			return res.status(404).json({ error: "Book not found." });
		}

		// Log the current state of 'requestedBy' for this book
		console.log("Current state of requestedBy:", bookToUnrequest.requestedBy);

		// Check if the book is actually requested by the user
		const isRequested = bookToUnrequest.requestedBy.some(
			(request) => request.userId.toString() === req.user._id.toString()
		);

		if (!isRequested) {
			console.log("User has not requested this book");
			return res
				.status(400)
				.json({ error: "You haven't requested this book." });
		}

		// Remove the user's details from the `requestedBy` array
		bookToUnrequest.requestedBy = bookToUnrequest.requestedBy.filter(
			(request) => request.userId.toString() !== req.user._id.toString()
		);

		// Log the updated state of 'requestedBy' before saving
		console.log("Updated state of requestedBy:", bookToUnrequest.requestedBy);

		// Update the user's `requestedBooks` list
		await User.findByIdAndUpdate(req.user._id, {
			$pull: { requestedBooks: bookToUnrequest._id },
		});

		// Save the updated book
		await bookToUnrequest.save();
		console.log("Book and user updated successfully");

		res.status(200).json({ message: "The Book was unrequested successfully." });
	} catch (error) {
		console.error("Error when unrequesting the book:", error);
		res.status(500).json({ error: "Error unrequesting the book." });
	}
});

// Mark a book as unavailable
router.patch("/unavailable/:bookId", checkAuthentication, async (req, res) => {
	try {
		// Fetch the book to be marked as unavailable using its ID
		const bookToUpdate = await Book.findById(req.params.bookId);
		if (!bookToUpdate) {
			console.log("Book not found with ID:", req.params.bookId);
			return res.status(404).json({ error: "Book not found." });
		}

		// Check if the book is already marked as unavailable
		if (bookToUpdate.status === "unavailable") {
			console.log("Book is already marked as unavailable");
			return res
				.status(400)
				.json({ error: "Book is already marked as unavailable." });
		}

		// Update the book's status to 'unavailable'
		bookToUpdate.status = "unavailable";

		// Save the updated book
		await bookToUpdate.save();
		console.log("Book marked as unavailable successfully");

		// Optionally, notify users who requested this book that it's now unavailable
		// This would require additional logic to find those users and update their view

		res
			.status(200)
			.json({ message: "Book marked as unavailable successfully." });
	} catch (error) {
		console.error("Error when updating the book status:", error);
		res.status(500).json({ error: "Error updating the book status." });
	}
});

module.exports = router;
