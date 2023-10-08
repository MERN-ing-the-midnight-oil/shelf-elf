// server/index.js

const mongoose = require("mongoose");

// ... (other requires and setup)

const MONGODB_URI = "mongodb://localhost:27017/others-covers-database";

mongoose
	.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongoDB Connected"))
	.catch((err) => console.log(err));
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5001; // or any other available port

app.use(express.json()); // for parsing application/json

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
	res.send("Hello, Others-Covers!");
});
