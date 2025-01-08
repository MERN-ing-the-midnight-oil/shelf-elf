const jwt = require("jsonwebtoken");
const User = require("../server/models/user"); // Adjust the path as needed

exports.checkAuthentication = async (req, res, next) => {
	console.log("checkAuthentication middleware called");
	try {
		if (!req.headers.authorization) {
			return res.status(401).json({ error: "Authorization header missing" });
		}

		const tokenParts = req.headers.authorization.split(" ");
		if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
			return res.status(401).json({ error: "Invalid token format" });
		}
		const token = tokenParts[1];

		const decodedToken = jwt.verify(
			token,
			process.env.JWT_SECRET || "mysecretkey"
		);

		const user = await User.findById(decodedToken.userId);
		if (!user) {
			return res.status(401).json({ error: "Invalid token" });
		}

		req.user = user.toObject();
		req.user._id = user._id;
		req.user.username = user.username;

		next();
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ error: "Invalid token" });
		}
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token has expired" });
		}
		res.status(500).json({ error: "Internal Server Error" });
	}
};
