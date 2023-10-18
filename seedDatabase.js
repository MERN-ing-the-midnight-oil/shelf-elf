//to run seeds, close the server connection and run "node seedDatabes.js"

const mongoose = require("mongoose");
const User = require("./server/models/user"); // Adjust path if needed
const Book = require("./server/models/book"); // Adjust path if needed

const { MONGODB_URI } = require("./server");
// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Ensure not to seed in production environment
if (process.env.NODE_ENV === "production") {
	console.error("Cannot seed database in production environment!");
	process.exit(1);
}

// Helper functions for data generation
function getRandomName() {
	const firstNames = [
		"John",
		"Jane",
		"Alex",
		"Emily",
		"Chris",
		"Katie",
		"Michael",
		"Sarah",
		"David",
		"Linda",
	];
	const lastNames = [
		"Smith",
		"Johnson",
		"Brown",
		"Williams",
		"Jones",
		"Miller",
		"Davis",
		"Garcia",
		"Rodriguez",
		"Martinez",
	];
	``;
	const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
	const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

	// Making sure user names are unique by giving them a unique middle name
	const middleName = Date.now().toString(36);

	return `${firstName} ${middleName} ${lastName}`;
}

function getRandomBookTitle() {
	const adjectives = ["Red", "Mysterious", "Brave", "Lonely", "Silent", "Wild"];
	const nouns = ["Moon", "Stars", "River", "Mountain", "Forest", "Dream"];
	const subjects = [
		"Journey",
		"Tales",
		"Stories",
		"Adventures",
		"Chronicles",
		"Diary",
	];
	const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	const subject = subjects[Math.floor(Math.random() * subjects.length)];
	return `The ${adjective} ${noun} - ${subject}`;
}

function getRandomAuthor() {
	const authors = [
		"J.K. Fake Rowling",
		"George Fake Orwell",
		"J.R.R. Fake Tolkien",
		"Isaac Fake Asimov",
		"Agatha Fake Christie",
		"Jane Fake Austen",
	];
	return authors[Math.floor(Math.random() * authors.length)];
}

function getRandomBook(userId) {
	return new Book({
		title: getRandomBookTitle(),
		author: getRandomAuthor(),
		status: "available",
		owner: userId,
	});
}

function generateDummyUser() {
	const user = new User({
		username: getRandomName(),
		email: `${getRandomName().split(" ").join("").toLowerCase()}@example.com`,
		password: "password123",
	});

	for (let j = 0; j < 10; j++) {
		const book = getRandomBook(user._id);
		user.lendingLibrary.push(book);
	}
	return user;
}

// Seed the database
async function seedDatabase() {
	try {
		for (let i = 0; i < 50; i++) {
			const user = generateDummyUser();
			await user.save(); // This also saves all the books in the user's lendingLibrary
		}
		console.log("Database seeded!");
	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		mongoose.connection.close();
	}
}

seedDatabase();
