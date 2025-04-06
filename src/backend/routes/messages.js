const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:userA/:userB", async (req, res) => {
  const { userA, userB } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT * FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
      `,
      [userA, userB]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
