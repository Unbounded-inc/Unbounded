const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const axios = require("axios");

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

    if (!password || !email || !username) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const profilePicture = "https://example.com/default-profile.png";

    try {
        // Step 1: Get access token from Auth0
        const tokenRes = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
            grant_type: "client_credentials",
        });

        const accessToken = tokenRes.data.access_token;

        // Step 2: Create user in Auth0
        const auth0User = await axios.post(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
            {
                connection: "Username-Password-Authentication",
                email,
                username, // <-- NEW
                password,
                given_name: firstName,
                family_name: lastName,
                phone_number: phoneNumber
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );


        const auth0Id = auth0User.data.user_id;

        // Step 3: Save user in PostgreSQL
        const hashedPassword = await bcrypt.hash(password, 10); // Optional if using Auth0 only

        const dbRes = await db.query(
            `INSERT INTO users (
                auth0_id, username, email, phone_number, is_anonymous, 
                profile_picture, bio, first_name, last_name, password_hash
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *`,
            [
                auth0Id,
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

        return res.status(201).json({ message: "User created", user: dbRes.rows[0] });

    } catch (err) {
        console.error("Signup error:", err.response?.data || err.message);
        return res.status(500).json({
            error: "Signup failed",
            details: err.response?.data || err.message,
        });
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
    const {
        username,
        email,
        phoneNumber,
        profile_picture,
        bio,
        first_name,
        last_name,
        privacy,
        notifications,
        is_anonymous
    } = req.body;

    if (
        !username && !email && !phoneNumber && !profilePicture &&
        !bio && !firstName && !lastName && anonymity === undefined
    ) {
        return res.status(400).json({ error: "At least one field must be updated" });
    }

    try {
        let fields = [];
        let values = [];
        let index = 1;

        if (username)       { fields.push(`username = $${index++}`); values.push(username); }
        if (email)          { fields.push(`email = $${index++}`); values.push(email); }
        if (phoneNumber)    { fields.push(`phone_number = $${index++}`); values.push(phoneNumber); }
        if (profile_picture){ fields.push(`profile_picture = $${index++}`); values.push(profile_picture); }
        if (bio)            { fields.push(`bio = $${index++}`); values.push(bio); }
        if (first_name)     { fields.push(`first_name = $${index++}`); values.push(first_name); }
        if (last_name)      { fields.push(`last_name = $${index++}`); values.push(last_name); }
        if (privacy)        { fields.push(`privacy = $${index++}`); values.push(privacy); }
        if (notifications !== undefined) { fields.push(`notifications = $${index++}`); values.push(notifications); }
        if (is_anonymous !== undefined)  { fields.push(`is_anonymous = $${index++}`); values.push(is_anonymous); }


        values.push(id);
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

router.get("/username/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await db.query(
      `SELECT id, username, profile_picture FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user by username:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error getting user by ID:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});



module.exports = router;