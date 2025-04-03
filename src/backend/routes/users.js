const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// lists users
router.get("/users", async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT id, username, email, phone_number, profile_picture, first_name, last_name, bio 
            FROM users 
            WHERE username ILIKE $1 OR email ILIKE $1 
            ORDER BY id 
            LIMIT $2 OFFSET $3
        `;
        const result = await db.query(query, [`%${search}%`, limit, offset]);

        res.json({ message: "Users retrieved", users: result.rows });
    } catch (err) {
        console.error("Failed to fetch users:", err.message);
        res.status(500).json({ error: "Failed to retrieve users", details: err.message });
    }
});

// adding a user
router.post("/add", async (req, res) => {
    const { username, email, phoneNumber, password, firstName, lastName } = req.body;

    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    const profilePicture = "https://example.com/default-profile.png";

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (
                username, email, phone_number, is_anonymous, 
                profile_picture, bio, first_name, last_name, password_hash
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                username,
                email,
                phoneNumber,
                false,
                profilePicture,
                "",
                firstName,
                lastName,
                hashedPassword
            ]
        );

        res.status(201).json({ message: "User added", user: result.rows[0] });
    } catch (err) {
        console.error("DB insert failed:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// removing a user
router.delete("/remove/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User removed", user: result.rows[0] });
    } catch (err) {
        console.error("DB delete failed:", err.message);
        res.status(500).json({ error: "Failed to remove user", details: err.message });
    }
});

// editing a user
router.put("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const { username, email, phoneNumber, profilePicture, bio, firstName, lastName } = req.body;

    if (
        !username && !email && !phoneNumber &&
        !profilePicture && !bio && !firstName && !lastName
    ) {
        return res.status(400).json({ error: "At least one field must be updated" });
    }

    try {
        // Dynamically build the update query based on provided fields
        let fields = [];
        let values = [];
        let index = 1;

        if (username) { fields.push(`username = $${index++}`); values.push(username); }
        if (email) { fields.push(`email = $${index++}`); values.push(email); }
        if (phoneNumber) { fields.push(`phone_number = $${index++}`); values.push(phoneNumber); }
        if (profilePicture) { fields.push(`profile_picture = $${index++}`); values.push(profilePicture); }
        if (bio) { fields.push(`bio = $${index++}`); values.push(bio); }
        if (firstName) { fields.push(`first_name = $${index++}`); values.push(firstName); }
        if (lastName) { fields.push(`last_name = $${index++}`); values.push(lastName); }

        values.push(id); // Last parameter is always the ID
        const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User updated", user: result.rows[0] });
    } catch (err) {
        console.error("DB update failed:", err.message);
        res.status(500).json({ error: "Failed to update user", details: err.message });
    }
});

module.exports = router;