// ... (other requires and setup)

// Importing route modules
const userRoutes = require("./routes/users");
const bookRoutes = require("./routes/books");

// Using routes
//"hey express, for any requests on this path, use this const to find the path to the correct files"
app.use("/api/users", userRoutes);

app.use("/api/books", bookRoutes);

// ... (the rest of your server setup)
