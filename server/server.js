const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();

// CORS options configuration
const corsOptions = {
	origin: "http://localhost:3000", // specify the application's address
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true,
	optionsSuccessStatus: 204,
};

// Middlewares
app.use(cors(corsOptions)); // Apply CORS middleware
app.use(express.json()); // For parsing application/json

// MongoDB Connection
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/others-covers-database";

mongoose
	.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("MongoDB Connected"))
	.catch((err) => console.log(err));

// Import and use routes
const bookRoutes = require("./routes/books"); // Adjusted for simplicity
const userRoutes = require("./routes/users"); // Adjusted for simplicity

app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes); // Use the userRoutes with the "/api/users" endpoint

//Deployment- serving the static files from express
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../build")));

	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../build", "index.html"));
	});
}

// Default Route (for testing)
app.get("/", (req, res) => {
	res.send("Hello, Others-Covers!");
});

// Server Listening
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

module.exports = {
	MONGODB_URI,
};
