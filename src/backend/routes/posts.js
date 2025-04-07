const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Create a new post
router.post("/", async (req, res) => {
    const { user_id, content, image_url, is_anonymous } = req.body;

    if (!user_id || !content) {
        return res.status(400).json({ error: "user_id and content are required" });
    }

    try {
        console.log("Incoming post:", { user_id, content, image_url, is_anonymous });
        const result = await db.query(
            `INSERT INTO posts (user_id, content, image_url, is_anonymous)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [user_id, content, image_url || null, is_anonymous || false]
        );

        res.status(201).json({ message: "Post created", post: result.rows[0] });
    } catch (err) {
        console.error("Failed to create post:", err.message);
        res.status(500).json({ error: "Failed to create post", details: err.message });
    }
});


// Get all posts with user info
router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
      SELECT posts.*, users.username, users.profile_picture
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `);

        res.json({ posts: result.rows });
    } catch (err) {
        console.error("Failed to fetch posts:", err.message);
        res.status(500).json({ error: "Failed to fetch posts", details: err.message });
    }
});

module.exports = router;