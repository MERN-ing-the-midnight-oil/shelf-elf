require("dotenv").config({ path: "../.env" }); // Adjust the path to the .env file
const jwt = require("jsonwebtoken");
// Load variables from .env
const secret = process.env.JWT_SECRET;
const adminUserId = process.env.ADMIN_USER_ID;

if (!adminUserId) {
	console.error("ADMIN_USER_ID is not defined in .env");
	process.exit(1);
}

const token = jwt.sign(
	{
		userId: adminUserId, // The admin's user ID
		role: "admin", // Assign the admin role
	},
	secret,
	{ expiresIn: "1y" } // Token expires in 1 hour
);

console.log("Generated Admin Token:", token);
