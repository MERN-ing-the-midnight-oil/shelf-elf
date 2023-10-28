require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Book = require("./server/models/book.js");
const User = require("./server/models/user.js");
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/others-covers-database";

(async () => {
	if (mongoose.connection.readyState === 0) {
		// 0 means disconnected
		await mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
	}
})();

const userNames = [
	"BrownBear1981",
	"SalmonSlayer",
	"GlacierGuider",
	"RainforestRover",
	"TotemCarver",
	"MidnightSunSeeker",
	"WhaleWatcher",
	"IcebergInnovator",
	"FjordFollower",
	"RavenReveler",
	"PineTreePioneer",
	"MooseMarauder",
	"TundraTraveler",
	"SitkaSpruceSavant",
	"EagleEyeEd",
	"NorthernLightsLover",
	"KetchikanClimber",
	"MendenhallMystic",
	"HalibutHero",
	"BearberryBuddy",
];

const authors = [
	"J.K. Bowling",
	"Ernesto Hemmingway",
	"George Orkwell",
	"Jane Aired",
	"Mark Twiddle",
	"William Shakesbeard",
	"Louisa May Allright",
	"Charles Duckins",
	"Stephen Kingpin",
	"Virginia Wolf",
	"Leo ToyStory",
	"Franz Cafka",
	"Fyodor DustyYevsky",
	"Agatha Mystery",
	"Jane Awesomesten",
	"Homerun",
	"James Joist",
	"John Grin",
	"Margaret Atwoot",
	"Isaac Asimoof",
];

const generateFunnyTitle = (authorName) => {
	const map = {
		"J.K. Bowling": [
			"Hairy Potter and the Philosophers Scone",
			"Hairy Potter and the Chamber of Soaps",
			"Hairy Potter and the Prisoner of Asda",
		],
		"Ernesto Hemmingway": [
			"The Old Man and the C",
			"For Whom the Taco Bell Tolls",
			"A Farewell to Charms",
		],
		"George Orkwell": ["1983½", "Farm of the Animals", "Baking in Catalonia"],
		"Jane Austentatious": [
			"Sense and Cents",
			"Proud and Prejudiced",
			"Mansfield Parking Lot",
		],
		"Oscar Wily": [
			"The Portrait of Dorian Grayish",
			"The Canterville Goose",
			"De Profundish",
		],
		"Mark Twinge": [
			"Adventures of Fish Finn",
			"A Connecticut Yankee in King Arthurs Short Court",
			"Toms Sawyer",
		],
		"F. Scott Fitsinhere": [
			"The Grape Gatsby",
			"This Side of Purgatory",
			"Tender is the Steak",
		],
		"William Shakyhands": [
			"Much Ado About Muffins",
			"Romeow and Julienne",
			"The Tempest in a Teacup",
		],
		"Louisa May Not": ["Little Ladies", "Jos Men", "Eight Lads"],
		"Stephen Queen": ["The Shunning", "Pet Cemetary Sale", "Cujos Cookies"],
	};

	return map[authorName]
		? map[authorName][Math.floor(Math.random() * map[authorName].length)]
		: "Unnamed Novel";
};

async function seedDatabase() {
	// Clear out any existing data
	await User.deleteMany({});
	await Book.deleteMany({});

	const passwordHash = await bcrypt.hash("BigBlueBus", 10);

	const users = [];
	for (const name of userNames) {
		const user = new User({
			username: name,
			email: `${name.toLowerCase()}@example.com`,
			password: passwordHash,
		});
		await user.save();
		users.push(user);
	}

	for (const author of authors) {
		for (let i = 0; i < 5; i++) {
			const owner = users[Math.floor(Math.random() * users.length)];
			const book = new Book({
				title: generateFunnyTitle(author),
				author,
				description: "This is a humorous book description.",
				imageUrl: "./src/images/placeholder.png",
				status: "available",
				owner: owner._id,
				requestedBy: [
					{
						userId: users[Math.floor(Math.random() * users.length)]._id,
						username: users[Math.floor(Math.random() * users.length)].username,
					},
					{
						userId: users[Math.floor(Math.random() * users.length)]._id,
						username: users[Math.floor(Math.random() * users.length)].username,
					},
				],
			});
			await book.save();
			owner.lendingLibrary.push(book);
			await owner.save();
		}
	}

	console.log("Database seeded!");
	mongoose.connection.close();
}

seedDatabase().catch((error) => {
	console.error("Error seeding the database:", error);
	process.exit(1);
});
