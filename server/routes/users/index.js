console.log("users/index.js directory name is " + __dirname); // Log the current directory.

const express = require("express");
const router = express.Router();
const User = require("../../models/user"); // Adjust the path as needed
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { checkAuthentication } = require("../../../middlewares/authentication");

router.get("/me", checkAuthentication, async (req, res) => {
	try {
		console.log("GET /me route accessed");
		//console.log("Authenticated user from middleware:", req.user);

		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		res.status(200).json(req.user);
	} catch (error) {
		console.error("Error in /me route:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
router.post("/register", async (req, res) => {
	console.log("Received a create a new user POST request on /register");
	const { username, password, email } = req.body;

	// Basic validation
	if (!username || !password || !email) {
		return res
			.status(400)
			.json({ error: "Username, password, and email are required." });
	}

	// Extended password requirements to include maximum length
	if (password.length < 5 || password.length > 50) {
		return res
			.status(400)
			.json({ error: "Password must be between 5 and 50 characters long." });
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res
			.status(400)
			.json({ error: "Please enter a valid email address." });
	}

	try {
		// Check if the username or email already exists
		const existingUser = await User.findOne({
			$or: [{ username }, { email }],
		});
		if (existingUser) {
			if (existingUser.username === username) {
				return res.status(400).json({ error: "Username already exists." });
			}
			if (existingUser.email === email) {
				return res.status(400).json({ error: "Email is already in use." });
			}
		}

		// Encrypt the password and create a new user
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({ username, password: hashedPassword, email });
		await newUser.save();

		console.log("New user created:", newUser);

		res
			.status(201)
			.json({ message: "User created successfully", user: newUser._id });
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ error: "Failed to create user." });
	}
});

// LOGIN route
// LOGIN route
router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		console.log("🔑 Incoming login request for:", username);

		// ✅ Ensure we fetch the `role` field from MongoDB
		const user = await User.findOne({ username }).select(
			"role username password"
		);

		if (!user) {
			console.warn("⛔ User not found in database:", username);
			return res.status(400).json({ error: "Invalid username or password" });
		}

		console.log("👤 User Found:", user);

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			console.warn("⛔ Password mismatch for user:", username);
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// 🔍 Log what we retrieved from the database
		console.log("🔍 User Role Retrieved from DB:", user.role);

		// ✅ Ensure `isAdmin` is properly assigned
		const isAdmin = user.role === "admin";
		console.log(`✅ Assigned isAdmin (${username}):`, isAdmin);

		const tokenPayload = {
			userId: user._id.toString(),
			username: user.username,
			role: user.role, // ✅ Explicitly include the role
			isAdmin: isAdmin, // ✅ Ensure isAdmin is explicitly included
		};

		console.log("📌 Token Payload Before Signing:", tokenPayload);

		const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
			expiresIn: "365d",
		});

		// ✅ Log final token payload
		console.log("✅ Generated Token Payload:", tokenPayload);
		console.log("🔑 Generated Token:", token);

		res.json({ token });
	} catch (error) {
		console.error("❌ Error during login:", error);
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
