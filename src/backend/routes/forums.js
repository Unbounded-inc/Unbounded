const express = require("express");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const router = express.Router();

// Create new forum
router.post("/", async (req, res) => {
  const { title, description, created_by, tags = [], is_anonymous = false } = req.body;

  if (!title || !description || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const id = uuidv4();
    const created_at = new Date();

    const insertResult = await pool.query(
        `INSERT INTO forums (id, title, description, created_by, tags, is_anonymous, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
        [id, title, description, created_by, tags, is_anonymous, created_at]
    );

    const forum = insertResult.rows[0];

    // Fetch user info for the newly created forum
    const userResult = await pool.query(
        `SELECT id, username, profile_picture FROM users WHERE id = $1`,
        [created_by]
    );

    forum.created_by_user = userResult.rows[0];
    res.status(201).json(forum);
  } catch (err) {
    console.error("Error creating forum:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all forums with user info
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        forums.*,
        json_build_object(
          'id', users.id,
          'username', users.username,
          'profile_picture', users.profile_picture
        ) AS created_by_user
      FROM forums
      JOIN users ON forums.created_by = users.id
      ORDER BY forums.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching forums:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a comment to a forum
router.post("/:forumId/comments", async (req, res) => {
  const { forumId } = req.params;
  const { user_id, content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Missing user_id or content" });
  }

  try {
    const id = uuidv4();
    const created_at = new Date();

    const insertResult = await pool.query(
        `INSERT INTO forum_threads (id, forum_id, user_id, content, created_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
        [id, forumId, user_id, content, created_at]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("Error posting comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get comments for a forum with user info
router.get("/:forumId/comments", async (req, res) => {
  const { forumId } = req.params;

  try {
    const result = await pool.query(
        `SELECT 
         forum_threads.*,
         json_build_object(
           'id', users.id,
           'username', users.username,
           'profile_picture', users.profile_picture
         ) AS user
       FROM forum_threads
       JOIN users ON forum_threads.user_id = users.id
       WHERE forum_threads.forum_id = $1
       ORDER BY forum_threads.created_at ASC`,
        [forumId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
