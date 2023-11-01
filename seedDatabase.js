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

const bookList = [
	{ author: "John Forest", title: "Journey through the Woods" },
	{ author: "Ella Rivers", title: "Mysteries of the Deep Seas" },
	{ author: "Lucy Stone", title: "Echoes in the Mountains" },
	{ author: "Benjamin Gale", title: "Whispers of the Wind" },
	{ author: "Rebecca Moon", title: "Nights under the Stars" },
	{ author: "Martin Green", title: "Walking with Nature" },
	{ author: "Olivia Frost", title: "Winter's Embrace" },
	{ author: "Daniel Sands", title: "Deserted Desires" },
	{ author: "Laura Sun", title: "Chasing the Daylight" },
	{ author: "Jake Flames", title: "Dancing with Fire" },
	{ author: "Sophie Snow", title: "Footprints in the White" },
	{ author: "Alex Tides", title: "Sailing the Horizon" },
	{ author: "Emma Heights", title: "Reaching the Summit" },
	{ author: "Michael Drizzle", title: "Moments before the Rain" },
	{ author: "Rachel Breeze", title: "Songs of the Zephyr" },
	{ author: "Tom Cave", title: "Secrets of the Underground" },
	{ author: "Zoe Sky", title: "Flying without Wings" },
	{ author: "Liam Wave", title: "Listening to the Ocean" },
	{ author: "Hannah Bloom", title: "Colors of Spring" },
	{ author: "Edward Peak", title: "Challenges of Heights" },
	{ author: "Nina Valley", title: "Stories from Below" },
	{ author: "George Island", title: "Tales of Solitude" },
	{ author: "Lily Ray", title: "Shadows and Silhouettes" },
	{ author: "Charlie Cloud", title: "Drifters in the Blue" },
	{ author: "Daisy Dust", title: "Twinkles in Twilight" },
	{ author: "James Magma", title: "Heart of the Volcano" },
	{ author: "Eva Lake", title: "Reflections in Tranquility" },
	{ author: "Harry Boulder", title: "Strength of the Stone" },
	{ author: "Isabel Oasis", title: "Mirage and Reality" },
	{ author: "Theodore Star", title: "Dreamers in the Night" },
	{ author: "Violet Dawn", title: "Awakening Hues" },
	{ author: "Robert Frostbite", title: "Chills of the North" },
	{ author: "Clara Dusk", title: "Twilight Tidings" },
	{ author: "Sean Aurora", title: "Dance of the Northern Lights" },
	{ author: "Amelia Wild", title: "Ventures in the Unknown" },
	{ author: "Ralph Woods", title: "Heartbeat of the Jungle" },
	{ author: "Grace Gale", title: "Voice of the Tornado" },
	{ author: "William Wisp", title: "Tales of the Mist" },
	{ author: "Chloe Comet", title: "Journey through Space" },
	{ author: "Samuel Thunder", title: "Echoes of the Storm" },
	{ author: "Bella Breeze", title: "Gentle Whispers" },
	{ author: "Lucas Lunar", title: "Cycle of the Moon" },
	{ author: "Madeline Meteor", title: "Flames in the Sky" },
	{ author: "Gabriel Glacier", title: "Chronicles of Ice" },
	{ author: "Isabelle Inferno", title: "Secrets of the Flame" },
	{ author: "Arthur Abyss", title: "Depths of the Unknown" },
	{ author: "Ella Eclipse", title: "Darkening of the Day" },
	{ author: "Ryan Ripple", title: "Movements in the Water" },
	{ author: "Grace Gravity", title: "Forces that Bind" },
	{ author: "Jerry Jetstream", title: "High above the Land" },
	{ author: "Mia Mist", title: "Veil of the Morning" },
	{ author: "Benjamin Boulder", title: "Standing Steadfast" },
	{ author: "Oliver Orbit", title: "Around the World" },
	{ author: "Sarah Sunbeam", title: "Warmth of Life" },
	{ author: "Daniel Delta", title: "Flowing to the Sea" },
	{ author: "Nina Nimbus", title: "Carriers of Rain" },
	{ author: "Frederick Frost", title: "Whisper of Cold" },
	{ author: "Layla Lightning", title: "Flashes in the Dark" },
];

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
	let bookCounter = 0;
	for (const user of users) {
		for (let i = 0; i < 3; i++) {
			// Check if bookCounter has exceeded the length of bookList
			if (bookCounter >= bookList.length) {
				console.error("Ran out of books to assign!");
				break; // Exit the inner loop if we have no more books to assign
			}

			const bookInfo = bookList[bookCounter];
			console.log("bookCounter:", bookCounter);
			console.log("bookList length:", bookList.length);
			console.log("Current user:", user.username);

			const book = new Book({
				title: bookInfo.title,
				author: bookInfo.author,
				description: "This is a book description.",
				imageUrl: "./src/images/placeholder.png",
				status: "available",
				owner: user._id,
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
			user.lendingLibrary.push(book);
			await user.save();
			bookCounter++; // Increment the counter
		}
	}

	console.log("Database seeded!");
	mongoose.connection.close();
}

seedDatabase().catch((error) => {
	console.error("Error seeding the database:", error);
	process.exit(1);
});
