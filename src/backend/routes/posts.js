const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const AWS = require("aws-sdk");
require("dotenv").config();
const { sendNotification } = require("../middleware/notify");
const generateAlias = require("../services/aliasUtils");

const upload = multer({ storage: multer.memoryStorage() });

const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(process.env.DO_SPACE_ENDPOINT),
    accessKeyId: process.env.DO_SPACE_KEY,
    secretAccessKey: process.env.DO_SPACE_SECRET,
});

router.post("/", upload.array("images"), async (req, res) => {
    const { user_id, content, is_anonymous, community_id } = req.body;
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

        const anonFlag = is_anonymous === true || is_anonymous === "true";
        const alias = anonFlag ? generateAlias() : null;

        console.log("incoming is_anonymous:", is_anonymous);
        console.log("parsed anonFlag:", anonFlag);
        console.log("generated alias:", alias);

        const result = await db.query(
            `INSERT INTO posts (
                id, user_id, content, image_urls, is_anonymous, anonymous_alias, community_id, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                 RETURNING *`,
            [
                uuidv4(),
                user_id,
                content,
                JSON.stringify(imageUrls),
                anonFlag,
                alias,
                community_id || null,
            ]
        );

        res.status(201).json({ message: "Post created", post: result.rows[0] });
    } catch (err) {
        console.error("Failed to create post:", err);
        res.status(500).json({ error: "Failed to create post", details: err });
    }
});

router.get("/", async (req, res) => {
    const { communityId } = req.query;

    let query = `
        SELECT
            posts.*,
            communities.name AS community_name,
            CASE
                WHEN posts.is_anonymous THEN posts.anonymous_alias
                ELSE users.username
                END AS display_name,
            users.profile_picture,
            COALESCE(COUNT(likes.id), 0) AS like_count,
            ARRAY_AGG(likes.user_id) FILTER (WHERE likes.user_id IS NOT NULL) AS liked_by_ids
        FROM posts
                 JOIN users ON posts.user_id = users.id
                 LEFT JOIN communities ON posts.community_id = communities.id
                 LEFT JOIN likes ON likes.post_id = posts.id
    `;

    const values = [];
    if (communityId) {
        query += ` WHERE posts.community_id = $1`;
        values.push(communityId);
    }

    query += `
    GROUP BY posts.id, users.id, communities.name
    ORDER BY posts.created_at DESC
  `;

    try {
        const result = await db.query(query, values);
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
            SELECT
                posts.*,
                CASE
                    WHEN posts.is_anonymous THEN posts.anonymous_alias
                    ELSE users.username
                    END AS display_name,
                users.profile_picture,
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

router.post("/users/:userId/communities", async (req, res) => {
    const { communityId } = req.body;
    const { userId } = req.params;

    try {
        await db.query(
            `INSERT INTO user_communities (user_id, community_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
            [userId, communityId]
        );
        res.status(200).json({ message: "Joined community" });
    } catch (err) {
        console.error("Join community error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


router.delete("/users/:userId/communities/:communityId", async (req, res) => {
    const { userId, communityId } = req.params;

    try {
        await db.query(
            "DELETE FROM user_communities WHERE user_id = $1 AND community_id = $2",
            [userId, communityId]
        );
        res.json({ message: "Community removed" });
    } catch (err) {
        console.error("Failed to remove community:", err);
        res.status(500).json({ error: "Could not remove community" });
    }
});

module.exports = router;
