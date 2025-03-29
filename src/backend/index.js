const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();




const app = express();
console.log("Database connection info:", {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
  });
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});