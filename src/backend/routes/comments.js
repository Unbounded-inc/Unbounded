const express = require("express");
const router = express.Router();
const db = require("../config/db");
const generateAlias = require("../services/aliasUtils");

// POST a new comment
router.post("/", async (req, res) => {
    const { post_id, user_id, content, is_anonymous = false } = req.body;

    if (!post_id || !user_id || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const alias = is_anonymous ? generateAlias() : null;

        const result = await db.query(
            `INSERT INTO comments (post_id, user_id, content, is_anonymous, anonymous_alias, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
            [post_id, user_id, content, is_anonymous, alias]
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
            `SELECT 
                comments.*, 
                CASE 
                    WHEN comments.is_anonymous THEN comments.anonymous_alias 
                    ELSE users.username 
                END AS display_name,
                users.profile_picture
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
