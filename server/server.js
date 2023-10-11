// server/index.js

// Importing necessary modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Instantiate express app
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
const MONGODB_URI = "mongodb://localhost:27017/others-covers-database";
mongoose
	.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("MongoDB Connected"))
	.catch((err) => console.log(err));

// Import and use routes
const bookRoutes = require("./routes/books/index"); // Assuming path is correct
const userRoutes = require("./routes/users/index"); // Add this line, adjust path as needed

app.use("/books", bookRoutes);
app.use("/api/users", userRoutes); // Use the userRoutes with the "/api/users" endpoint

// Default Route (for testing)
app.get("/", (req, res) => {
	res.send("Hello, Others-Covers!");
});

// Server Listening
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
