const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

const allowedOrigins = [
	"http://localhost:3000",
	"https://bellingham-buy-nothing-books-9fe5de7a4a15.herokuapp.com",
	"https://shelf-elf-4b02ddd52e38.herokuapp.com",
];

const corsOptions = {
	origin: function (origin, callback) {
		if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true,
	optionsSuccessStatus: 204,
};

// Log All Incoming Requests Middleware
app.use((req, res, next) => {
	console.log(`Incoming request: ${req.method} ${req.path}`);
	console.log("Headers:", req.headers);
	next();
});

// Middlewares
app.use(cors(corsOptions)); // Apply CORS middleware
app.use(express.json()); // For parsing application/json

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

console.log("Connecting to MongoDB URI:", MONGODB_URI);

mongoose
	.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("MongoDB Connected"))
	.catch((err) => console.log("there is a problem with mongoose " + err));

// Import authentication middlewares
const {
	checkAuthentication,
	adminCheck,
} = require("../middlewares/authentication");

// Import and use routes
const bookRoutes = require("./routes/books");
const userRoutes = require("./routes/users");
const communityRoutes = require("./routes/communities/");
const gameRoutes = require("./routes/games");
const messageRoutes = require("./routes/messages");

app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/messages", messageRoutes);

// Test route to verify authentication and admin access
app.get("/api/admin-test", checkAuthentication, adminCheck, (req, res) => {
	res.status(200).json({ message: `Hello, Admin ${req.user.username}` });
});

// Deployment - Serving the static files from express
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../build")));

	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../build", "index.html"));
	});
}

// Server Listening
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

module.exports = {
	MONGODB_URI,
};
