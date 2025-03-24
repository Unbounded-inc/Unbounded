const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);

// Database connection check
(async () => {
    try {
        await db.query("SELECT 1");
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
})();

// Root Route
app.get("/", (req, res) => {
    res.send("Welcome to the User Management API");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
