const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const AWS = require("aws-sdk");
require("dotenv").config();
const { sendNotification } = require("../middleware/notify");

// Use memory storage for multer
const upload = multer({ storage: multer.memoryStorage() });

// Configure AWS SDK for DigitalOcean Spaces
const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(process.env.DO_SPACE_ENDPOINT),
    accessKeyId: process.env.DO_SPACE_KEY,
    secretAccessKey: process.env.DO_SPACE_SECRET,
});

// Create a post with optional image uploads (multiple)
router.post("/", upload.array("images"), async (req, res) => {
    const { user_id, content, is_anonymous } = req.body;
    const files = req.files || [];

    if (!user_id || !content) {
        return res.status(400).json({ error: "user_id and content are required" });
    }

    try {
        const imageUrls = [];

        for (const file of files) {
            const fileName = `${Date.now()}-${file.originalname}`;
            const params = {
                Bucket: process.env.DO_SPACE_BUCKET,
                Key: fileName,
                Body: file.buffer,
                ACL: "public-read",
                ContentType: file.mimetype,
            };

            const uploadResult = await s3.upload(params).promise();
            imageUrls.push(uploadResult.Location);
        }

        const result = await db.query(
            `INSERT INTO posts (id, user_id, content, image_urls, is_anonymous, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                 RETURNING *`,
            [uuidv4(), user_id, content, JSON.stringify(imageUrls), is_anonymous === "true"]
        );

        res.status(201).json({ message: "Post created", post: result.rows[0] });
    } catch (err) {
        console.error("Failed to create post:", err);
        res.status(500).json({ error: "Failed to create post", details: err });
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

router.post("/:postId/like", async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;

    try {
        const existing = await db.query(
            "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
            [postId, userId]
        );

        if (existing.rows.length > 0) {
            await db.query("DELETE FROM likes WHERE post_id = $1 AND user_id = $2", [postId, userId]);
            return res.json({ message: "Unliked" });
        }

        await db.query(
            "INSERT INTO likes (post_id, user_id, created_at) VALUES ($1, $2, NOW())",
            [postId, userId]
        );

        const postResult = await db.query(
            `SELECT posts.user_id AS post_owner_id, users.username
             FROM posts
                      JOIN users ON users.id = $2
             WHERE posts.id = $1`,
            [postId, userId]
        );

        const { post_owner_id, username } = postResult.rows[0];

        if (post_owner_id !== userId) {
            const content = `${username} liked your post.`;
            const notifId = uuidv4();

            await db.query(
                `INSERT INTO notifications (id, user_id, type, content, is_read, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [notifId, post_owner_id, "like", content, false]
            );

            sendNotification(post_owner_id, content);
        }

        res.json({ message: "Liked" });
    } catch (err) {
        console.error("Error toggling like:", err.message);
        res.status(500).json({ error: "Failed to toggle like", details: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    try {
        const postResult = await db.query("SELECT user_id, image_urls FROM posts WHERE id = $1", [id]);
        if (postResult.rows.length === 0) return res.status(404).json({ error: "Post not found" });

        const post = postResult.rows[0];
        if (post.user_id !== user_id) {
            return res.status(403).json({ error: "Unauthorized to delete this post" });
        }

        const imageUrls = post.image_urls || [];

        for (const url of imageUrls) {
            const key = url.replace(`https://${process.env.DO_SPACE_BUCKET}.${process.env.DO_SPACE_ENDPOINT}/`, "");
            console.log("Deleting from bucket:", key);
            await s3.deleteObject({
                Bucket: process.env.DO_SPACE_BUCKET,
                Key: key,
            }).promise();
        }

        await db.query("DELETE FROM posts WHERE id = $1", [id]);
        res.json({ message: "Post and images deleted" });
    } catch (err) {
        console.error("Failed to delete post:", err.message);
        res.status(500).json({ error: "Failed to delete post" });
    }
});

router.get("/friends/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const query = `
            SELECT posts.*, users.username, users.profile_picture,
                   ARRAY_AGG(likes.user_id) AS liked_by_ids,
                   COUNT(likes.user_id) AS like_count
            FROM posts
                     JOIN users ON users.id = posts.user_id
                     LEFT JOIN likes ON likes.post_id = posts.id
            WHERE posts.user_id IN (
                SELECT CASE
                           WHEN sender_id = $1 THEN receiver_id
                           WHEN receiver_id = $1 THEN sender_id
                           END
                FROM friend_requests
                WHERE (sender_id = $1 OR receiver_id = $1)
                  AND status = 'accepted'
            )
            GROUP BY posts.id, users.username, users.profile_picture
            ORDER BY posts.created_at DESC;
        `;

        const result = await db.query(query, [userId]);
        res.json({ posts: result.rows });
    } catch (err) {
        console.error("Failed to fetch friends' posts:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
