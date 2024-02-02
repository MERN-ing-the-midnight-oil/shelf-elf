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

		// You might not want to send back all user data; select only what's needed
		const userData = {
			username: req.user.username,
			email: req.user.email,
			_id: req.user._id,
			// ... (other necessary user fields)
		};

		res.json(userData);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

// POST route to create a new user
router.post("/register", async (req, res) => {
	console.log("Received a create a new user POST request on /");
	try {
		const { username, email, password, street1, street2, zipCode } = req.body;

		// Basic validation
		if (!username || !email || !password || !street1 || !street2 || !zipCode) {
			return res.status(400).json({ error: "All fields are required" });
		}
		if (!validator.isEmail(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Additional validation for street1, street2, and zipCode can be added here if needed

		// Encrypt the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create a new user with all fields
		const newUser = new User({
			username,
			email,
			password: hashedPassword,
			street1,
			street2,
			zipCode,
		});
		await newUser.save();
		res
			.status(201)
			.json({ message: "User created successfully", user: newUser._id }); // Respond with the user ID
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error"); // Respond with a generic error message
	}
});

// LOGIN route
router.post("/login", async (req, res) => {
	try {
		// Destructure email and password from the request body
		const { email, password } = req.body;

		// Check if email and password are provided
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ error: "Invalid email or password" });
		}

		// Compare the provided password with the hashed password in the database
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ error: "Invalid email or password" });
		}

		// User is authenticated, generate a token
		const token = jwt.sign(
			{ userId: user._id, username: user.username },
			"mysecretkey", //  store secret key in environment variables
			{ expiresIn: "1h" }
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

//Display the logged in users lending library
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
