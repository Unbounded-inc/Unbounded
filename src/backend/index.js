const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
