// ... (other requires and setup)

// Importing route modules
const userRoutes = require("./routes/users");
const bookRoutes = require("./routes/books");

// Using routes
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);

// ... (the rest of your server setup)
