const express = require("express");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const router = express.Router();

router.post("/", async (req, res) => {
  const { title, description, created_by, tags = [], is_anonymous = false } = req.body;

  if (!title || !description || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const id = uuidv4();
    const created_at = new Date();

    const result = await pool.query(
        `INSERT INTO forums (id, title, description, created_by, tags, is_anonymous, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
        [id, title, description, created_by, tags, is_anonymous, created_at]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating forum:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM forums ORDER BY created_at DESC`);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching forums:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:forumId/comments", async (req, res) => {
  const { forumId } = req.params;
  const { user_id, content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Missing user_id or content" });
  }

  try {
    const id = uuidv4();
    const created_at = new Date();

    const result = await pool.query(
        `INSERT INTO forum_threads (id, forum_id, user_id, content, created_at)
         VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
        [id, forumId, user_id, content, created_at]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error posting comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:forumId/comments", async (req, res) => {
  const { forumId } = req.params;

  try {
    const result = await pool.query(
        `SELECT * FROM forum_threads WHERE forum_id = $1 ORDER BY created_at ASC`,
        [forumId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
