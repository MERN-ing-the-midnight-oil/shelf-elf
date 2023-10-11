const express = require("express");
const router = express.Router();
const User = require("../../models/user"); // Adjust the path as needed
const validator = require("validator");
const bcrypt = require("bcryptjs");

// GET route to retrieve all users (consider pagination for large data sets)
router.get("/", async (req, res) => {
	try {
		const users = await User.find({});
		res.json(users);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

// POST route to create a new user
router.post("/", async (req, res) => {
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

module.exports = router;
