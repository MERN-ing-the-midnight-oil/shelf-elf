console.log("users/index.js directory name is " + __dirname); // Log the current directory.

const express = require("express");
const router = express.Router();
const User = require("../../models/user"); // Adjust the path as needed
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { checkAuthentication } = require("../../../middlewares/authentication");

router.get("/me", checkAuthentication, async (req, res) => {
	try {
		// Assuming that the checkAuthentication middleware sets req.user
		if (!req.user) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		// Adjust the response to include only the necessary user fields
		const userData = {
			username: req.user.username,
			_id: req.user._id,
			// Add any other user fields that you might need in the frontend
		};

		res.json(userData);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

router.post("/register", async (req, res) => {
	console.log("Received a create a new user POST request on /register");
	const { username, password } = req.body;

	// Basic validation
	if (!username || !password) {
		return res
			.status(400)
			.json({ error: "Username and password are required" });
	}

	// Simplified password requirements
	if (password.length < 5) {
		return res
			.status(400)
			.json({ error: "Password must be at least 5 characters long" });
	}

	// Check if the username already exists
	const existingUser = await User.findOne({ username });
	if (existingUser) {
		return res.status(400).json({ error: "Username already exists" });
	}

	// Encrypt the password and create a new user
	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = new User({ username, password: hashedPassword });
	await newUser.save();

	res
		.status(201)
		.json({ message: "User created successfully", user: newUser._id });
});

// LOGIN route
router.post("/login", async (req, res) => {
	try {
		// Destructure username and password from the request body
		const { username, password } = req.body;

		// Check if username and password are provided
		if (!username || !password) {
			return res
				.status(400)
				.json({ error: "Username and password are required" });
		}

		// Find user by username
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// Compare the provided password with the hashed password in the database
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// User is authenticated, generate a token
		const token = jwt.sign(
			{ userId: user._id, username: user.username },
			"mysecretkey", //  store secret key in environment variables
			{ expiresIn: "365d" }
		);

		// Send token back as a response
		res.json({ token });
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

// GET route to fetch communities associated with the logged-in user
router.get("/my-communities", checkAuthentication, async (req, res) => {
	console.log("router received request at /my-communities");
	try {
		// Assuming checkAuthentication middleware sets req.user
		const user = await User.findById(req.user._id).populate("communities");
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		console.log("User communities fetched:", user.communities);
		// Respond with the communities
		res.status(200).json(user.communities);
	} catch (error) {
		console.error("Error in the /my-communities route:", error);
		res.status(500).json({ error: "Failed to fetch communities" });
	}
});

//Display the logged in users books lending library
router.get("/lending-library", async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate("lendingLibrary");
		res.status(200).json(user.lendingLibrary);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch lending library" });
	}
});
// Display the logged-in user's requested books
router.get("/requested-books", checkAuthentication, async (req, res) => {
	console.log("Requested Books Route Hit");

	try {
		// Assuming checkAuthentication middleware sets req.user
		const user = await User.findById(req.user._id).populate({
			path: "requestedBooks",
			// The outer populate should select the fields from the Book model, including the 'owner' reference
			select: "title author description imageUrl status owner",
			populate: {
				path: "owner",
				// The inner populate selects the fields from the User model
				select: "username street1 street2 zipCode", // Include location fields here
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}

		res.status(200).json(user.requestedBooks);
	} catch (error) {
		console.error("Failed to fetch requested books. Error:", error);
		res.status(500).json({ error: "Failed to fetch requested books" });
	}
});

module.exports = router;
