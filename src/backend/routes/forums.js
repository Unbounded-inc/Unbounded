const express = require("express");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const generateAlias = require("../services/aliasUtils");

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
    const alias = is_anonymous ? generateAlias() : null;

    const insertResult = await pool.query(
        `INSERT INTO forums (id, title, description, created_by, tags, is_anonymous, anonymous_alias, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
        [id, title, description, created_by, tags, is_anonymous, alias, created_at]
    );

    const forum = insertResult.rows[0];

    // Fetch user info (real or alias)
    if (is_anonymous) {
      forum.created_by_user = {
        username: alias,
        profile_picture: null
      };
    } else {
      const userResult = await pool.query(
          `SELECT id, username, profile_picture FROM users WHERE id = $1`,
          [created_by]
      );
      forum.created_by_user = userResult.rows[0];
    }

    res.status(201).json(forum);
  } catch (err) {
    console.error("Error creating forum:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all forums with user info or alias
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        forums.*,
        CASE 
          WHEN forums.is_anonymous THEN json_build_object('username', forums.anonymous_alias, 'profile_picture', NULL)
          ELSE json_build_object('id', users.id, 'username', users.username, 'profile_picture', users.profile_picture)
        END AS created_by_user
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
  const { user_id, content, is_anonymous = false } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Missing user_id or content" });
  }

  try {
    const id = uuidv4();
    const created_at = new Date();
    const alias = is_anonymous ? generateAlias() : null;

    const insertResult = await pool.query(
        `INSERT INTO forum_threads (id, forum_id, user_id, content, is_anonymous, anonymous_alias, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
        [id, forumId, user_id, content, is_anonymous, alias, created_at]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("Error posting comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get comments for a forum
router.get("/:forumId/comments", async (req, res) => {
  const { forumId } = req.params;

  try {
    const result = await pool.query(
        `SELECT 
         forum_threads.*,
         CASE 
           WHEN forum_threads.is_anonymous THEN json_build_object('username', forum_threads.anonymous_alias, 'profile_picture', NULL)
           ELSE json_build_object('id', users.id, 'username', users.username, 'profile_picture', users.profile_picture)
         END AS user
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

// Delete a forum
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM forums WHERE id = $1", [id]);
    res.json({ message: "Forum deleted" });
  } catch (err) {
    console.error("Failed to delete forum:", err.message);
    res.status(500).json({ error: "Failed to delete forum" });
  }
});

module.exports = router;
