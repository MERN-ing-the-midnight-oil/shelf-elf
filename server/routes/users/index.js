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
		const { username, email, password } = req.body;

		// Basic validation
		if (!username || !email || !password) {
			return res.status(400).json({ error: "All fields are required" });
		}
		if (!validator.isEmail(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Encrypt the password
		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({ username, email, password: hashedPassword });
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

//Display the logged in users lending library
router.get("/lending-library", async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate("lendingLibrary");
		res.status(200).json(user.lendingLibrary);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch lending library" });
	}
});
//Display the logged in user's requested books
router.get("/requested-books", checkAuthentication, async (req, res) => {
	console.log("Requested Books Route Hit");
	console.log("User from req.user:", req.user);

	// Detailed logging
	console.log("Headers:", req.headers);
	console.log("Body:", req.body);
	console.log("Params:", req.params);
	console.log("Query:", req.query);

	try {
		// Assuming checkAuthentication middleware sets req.user
		const user = await User.findById(req.user._id).populate({
			path: "requestedBooks",
			populate: {
				path: "owner",
				select: "username",
			},
			select: "title author description imageUrl status owner", // Select the fields you want to include
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
