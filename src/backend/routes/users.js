const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

router.post("/add", async (req, res) => {
    const { username, email, phoneNumber, password } = req.body;

    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    const profilePicture = "https://example.com/default-profile.png";

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (username, email, phone_number, is_anonymous, profile_picture, bio, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [username, email, phoneNumber, false, profilePicture, "", hashedPassword]
        );

        res.status(201).json({ message: "✅ User added", user: result.rows[0] });
    } catch (err) {
        console.error("❌ DB insert failed:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
