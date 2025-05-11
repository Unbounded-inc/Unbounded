const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST a new comment
router.post("/", async (req, res) => {
    const { post_id, user_id, content } = req.body;

    if (!post_id || !user_id || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await db.query(
            `INSERT INTO comments (post_id, user_id, content, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [post_id, user_id, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Failed to create comment:", err.message);
        res.status(500).json({ error: "Failed to create comment" });
    }
});

// GET comments for a post
router.get("/:postId", async (req, res) => {
    const { postId } = req.params;

    try {
        const result = await db.query(
            `SELECT comments.*, users.username, users.profile_picture
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.post_id = $1
       ORDER BY comments.created_at DESC`,
            [postId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Failed to fetch comments:", err.message);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

module.exports = router;
