const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
    const { user_id, content, is_anonymous } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!user_id || !content) {
        return res.status(400).json({ error: "user_id and content are required" });
    }

    try {
        const result = await db.query(
            `INSERT INTO posts (user_id, content, image_url, is_anonymous)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [user_id, content, image_url, is_anonymous === "true"]
        );

        res.status(201).json({ message: "Post created", post: result.rows[0] });
    } catch (err) {
        console.error("Failed to create post:", err.message);
        res.status(500).json({ error: "Failed to create post", details: err.message });
    }
});


router.get("/", async (req, res) => {
    try {
        const result = await db.query(`
      SELECT 
        posts.*, 
        users.username, 
        users.profile_picture,
        COALESCE(COUNT(likes.id), 0) AS like_count,
        ARRAY_AGG(likes.user_id) FILTER (WHERE likes.user_id IS NOT NULL) AS liked_by_ids
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON likes.post_id = posts.id
      GROUP BY posts.id, users.id
      ORDER BY posts.created_at DESC
    `);

        res.json({ posts: result.rows });
    } catch (err) {
        console.error("Failed to fetch posts:", err.message);
        res.status(500).json({ error: "Failed to fetch posts", details: err.message });
    }
});


// Like/unlike a post
router.post("/:postId/like", async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;

    try {
        // Check if like already exists
        const existing = await db.query(
            "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
            [postId, userId]
        );

        if (existing.rows.length > 0) {
            // Unlike
            await db.query("DELETE FROM likes WHERE post_id = $1 AND user_id = $2", [postId, userId]);
            return res.json({ message: "Unliked" });
        }

        // Like
        await db.query(
            "INSERT INTO likes (post_id, user_id, created_at) VALUES ($1, $2, NOW())",
            [postId, userId]
        );

        res.json({ message: "Liked" });
    } catch (err) {
        console.error("Error toggling like:", err.message);
        res.status(500).json({ error: "Failed to toggle like", details: err.message });
    }
});


module.exports = router;