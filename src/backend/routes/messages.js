const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT m.id, m.room_id, m.sender_id, m.content, m.created_at,
             u.username AS sender_username
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.room_id = $1
      ORDER BY m.created_at ASC
      `,
      [roomId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({message: "Failed to load messages"});
  }
});

module.exports = router;
