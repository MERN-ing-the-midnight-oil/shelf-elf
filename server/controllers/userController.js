const User = require("../models/user");

exports.createUser = async (req, res) => {
	try {
		const newUser = await User.create(req.body);
		res.status(201).json(newUser);
	} catch (error) {
		res.status(400).json({ error });
	}
};

exports.getUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		res.status(200).json(user);
	} catch (error) {
		res.status(400).json({ error });
	}
};

// Add other necessary controller functions, like updating and deleting a user.
