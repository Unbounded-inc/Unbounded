//this is for messaging logic, messages.js is actual messaging

const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/one-on-one", async (req, res) => {
  console.log("POST /api/chat-rooms/one-on-one called", req.body);
  const { userAId, userBId } = req.body;

  if (!userAId || !userBId) {
    return res.status(400).json({ error: "Missing user IDs" });
  }

  try {
    // Check if a room already exists between both users
    const result = await pool.query(
      `
      SELECT crm.room_id
      FROM chat_room_members crm
      JOIN (
        SELECT room_id
        FROM chat_room_members
        WHERE user_id = $1 OR user_id = $2
        GROUP BY room_id
        HAVING COUNT(*) = 2
      ) matched_rooms ON crm.room_id = matched_rooms.room_id
      GROUP BY crm.room_id
      HAVING COUNT(*) = 2
      `,
      [userAId, userBId]
    );

    if (result.rows.length > 0) {
      return res.json({ roomId: result.rows[0].room_id });
    }

    // ✅ Otherwise, create new room
    const newRoom = await pool.query(
      `INSERT INTO chat_rooms (is_group) VALUES (false) RETURNING id`
    );

    const roomId = newRoom.rows[0].id;

    // ✅ Use ON CONFLICT DO NOTHING just in case
    await pool.query(
      `
      INSERT INTO chat_room_members (user_id, room_id)
      VALUES ($1, $2), ($3, $2)
      ON CONFLICT DO NOTHING
      `,
      [userAId, roomId, userBId]
    );

    res.status(201).json({ roomId });
  } catch (err) {
    console.error("💥 Failed to create chat room:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }


});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const roomResult = await pool.query(
      `SELECT room_id FROM chat_room_members WHERE user_id = $1`,
      [userId]
    );

    const roomIds = roomResult.rows.map((r) => r.room_id);
    if (roomIds.length === 0) return res.json([]);

    const roomUsersResult = await pool.query(
      `
      SELECT crm.room_id, u.id AS user_id, u.username
      FROM chat_room_members crm
      JOIN users u ON u.id = crm.user_id
      WHERE crm.room_id = ANY($1::uuid[])
        AND crm.user_id != $2
      `,
      [roomIds, userId]
    );

    const formatted = roomUsersResult.rows.map((row) => ({
      roomId: row.room_id,
      user: {
        id: row.user_id,
        username: row.username,
        name: row.name,
        profilePic: row.profile_pic,
      },
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Failed to load chat rooms:", err.stack || err);
    res.status(500).json({ error: "Failed to load chat rooms" });
  }
});


module.exports = router;
