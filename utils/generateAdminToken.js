require("dotenv").config({
	path: require("path").resolve(__dirname, "../.env"),
}); // ✅ Ensures correct path
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
const adminUserId = process.env.ADMIN_USER_ID;

// ✅ Debugging to confirm `.env` variables are loaded
console.log("🔍 Checking .env variables...");
console.log("🔑 JWT_SECRET:", secret ? "Loaded ✅" : "Not Found ❌");
console.log("👤 ADMIN_USER_ID:", adminUserId ? adminUserId : "Not Found ❌");

// ✅ Stop execution if variables are missing
if (!secret) {
	console.error("❌ JWT_SECRET is not defined in .env");
	process.exit(1);
}
if (!adminUserId) {
	console.error("❌ ADMIN_USER_ID is not defined in .env");
	process.exit(1);
}

// ✅ Generate token using correct values
const token = jwt.sign(
	{
		userId: adminUserId,
		role: "admin",
		isAdmin: true,
	},
	secret,
	{ expiresIn: "1y" }
);

console.log("✅ Generated Admin Token:", token);
