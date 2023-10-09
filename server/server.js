// server/index.js

// Importing necessary modules
const express = require("express"); // express is a framework for building web servers
const mongoose = require("mongoose"); // mongoose is an ODM (Object Document Mapper) for MongoDB

// Creating an Express application
const app = express();

// Setting up the port number; process.env.PORT is for deployment (like on Heroku), and 5001 is for local development
const PORT = process.env.PORT || 5001;

// Defining the MongoDB URI; it's the path to the MongoDB database we want to connect to
const MONGODB_URI = "mongodb://localhost:27017/others-covers-database";

// Connecting to MongoDB using Mongoose; providing necessary options to avoid warnings
mongoose
	.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongoDB Connected")) // Logging a message on successful connection
	.catch((err) => console.log(err)); // Logging any error that occurs during the connection

// Middlewares
app.use(express.json()); // Allows Express to parse incoming JSON requests

// Dummy Route - For testing if server is running; sends "Hello, Others-Covers!" when you access the server's root URL
app.get("/", (req, res) => {
	res.send("Hello, Others-Covers!");
});

// TODO: Add your routes here when they are ready
// Example: app.use('/api/users', require('./routes/userRoutes'));

// Starting the server on the defined port; logs a message to the console on successful start
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
