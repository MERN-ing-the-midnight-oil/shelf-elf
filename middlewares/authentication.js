require("dotenv").config({
	path: require("path").resolve(__dirname, "../.env"),
});
const jwt = require("jsonwebtoken");
const User = require("../server/models/user"); // Adjust the path as needed

console.log("JWT_SECRET in middleware:", process.env.JWT_SECRET); // Debug statement

require("dotenv").config({
	path: require("path").resolve(__dirname, "../.env"),
}); // Load .env file
exports.checkAuthentication = async (req, res, next) => {
	console.log("🔑 checkAuthentication middleware called");
	try {
		console.log("🛠️ Request Headers:", req.headers);

		if (!req.headers.authorization) {
			console.error("⛔ Authorization header missing");
			return res.status(401).json({ error: "Authorization header missing" });
		}

		const tokenParts = req.headers.authorization.split(" ");
		if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
			console.error("⛔ Invalid token format");
			return res.status(401).json({ error: "Invalid token format" });
		}

		const token = tokenParts[1];
		console.log("✅ Token received:", token);

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
		console.log("🔓 Decoded token:", decodedToken);

		const user = await User.findById(decodedToken.userId);
		if (!user) {
			console.error("⛔ User not found for ID:", decodedToken.userId);
			return res.status(401).json({ error: "Invalid token" });
		}

		console.log(`✅ Authenticated user: ${user.username} (ID: ${user._id})`);
		console.log(`👤 User Role: ${user.role}`);

		// Ensure `isAdmin` is included in `req.user`
		req.user = user.toObject();
		req.user._id = user._id;
		req.user.username = user.username;
		req.user.isAdmin = user.role === "admin"; // ✅ Ensure `isAdmin` is set

		next();
	} catch (error) {
		console.error("⛔ Token verification error:", error.message);
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ error: "Invalid token" });
		}
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token has expired" });
		}
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// Middleware to check for admin role
exports.adminCheck = (req, res, next) => {
	console.log(
		`🛡️ adminCheck middleware called for user: ${
			req.user?.username || "unknown"
		}`
	);
	console.log(
		`🔍 Checking admin status... isAdmin: ${req.user?.isAdmin}, Role: ${req.user?.role}`
	);

	if (!req.user || req.user.role !== "admin") {
		console.warn(
			`⛔ Access denied for user: ${req.user?.username || "unknown"}`
		);
		return res.status(403).json({ error: "Access denied. Admins only." });
	}

	console.log(`✅ Admin access granted for: ${req.user.username}`);
	next();
};
