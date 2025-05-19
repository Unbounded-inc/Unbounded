// backend/routes/chats.js — PATCHED: use one roomId param, not multiple duplicates

const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Create one-on-one chat
router.post("/one-on-one", async (req, res) => {
  const { userAId, userBId } = req.body;

  if (!userAId || !userBId) {
    return res.status(400).json({ error: "Missing user IDs" });
  }

  try {
    const result = await pool.query(
      `SELECT crm.room_id
       FROM chat_room_members crm
       JOIN (
         SELECT room_id FROM chat_room_members
         WHERE user_id = $1 OR user_id = $2
         GROUP BY room_id
         HAVING COUNT(*) = 2
       ) matched_rooms ON crm.room_id = matched_rooms.room_id
       GROUP BY crm.room_id
       HAVING COUNT(*) = 2`,
      [userAId, userBId]
    );

    if (result.rows.length > 0) {
      return res.json({ roomId: result.rows[0].room_id });
    }

    const newRoom = await pool.query(
      `INSERT INTO chat_rooms (is_group) VALUES (false) RETURNING id`
    );
    const roomId = newRoom.rows[0].id;

    await pool.query(
      `INSERT INTO chat_room_members (user_id, room_id) VALUES ($1, $2), ($3, $2)`,
      [userAId, roomId, userBId]
    );

    res.status(201).json({ roomId });
  } catch (err) {
    console.error("Failed to create one-on-one chat:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create group chat (deduplicates)
router.post("/group", async (req, res) => {
  const { name, memberIds } = req.body;

  if (!name || !Array.isArray(memberIds) || memberIds.length < 2) {
    return res.status(400).json({ error: "Name and at least 2 members required" });
  }

  try {
    const sortedIds = memberIds.slice().sort();

    const candidateRooms = await pool.query(
      `SELECT crm.room_id
       FROM chat_room_members crm
       JOIN chat_rooms cr ON cr.id = crm.room_id
       WHERE cr.is_group = true
       GROUP BY crm.room_id
       HAVING COUNT(DISTINCT crm.user_id) = $1`,
      [sortedIds.length]
    );

    for (const row of candidateRooms.rows) {
      const roomId = row.room_id;
      const membersResult = await pool.query(
        `SELECT user_id FROM chat_room_members WHERE room_id = $1 ORDER BY user_id`,
        [roomId]
      );
      const dbIds = membersResult.rows.map(r => r.user_id);
      const match = dbIds.join(",") === sortedIds.join(",");
      if (match) {
        return res.json({ roomId });
      }
    }

    const newRoom = await pool.query(
      `INSERT INTO chat_rooms (is_group, name) VALUES (true, $1) RETURNING id`,
      [name]
    );
    const roomId = newRoom.rows[0].id;

    const placeholders = memberIds.map((_, i) => `($${i + 1}, $${memberIds.length + 1})`).join(", ");
    const values = [...memberIds, roomId];

    await pool.query(
      `INSERT INTO chat_room_members (user_id, room_id) VALUES ${placeholders}`,
      values
    );

    res.status(201).json({ roomId });
  } catch (err) {
    console.error("Failed to create group chat:", { message: err.message, stack: err.stack });
    res.status(500).json({ error: "Server error" });
  }
});

// Get all chat rooms for a user, including message counts
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `WITH user_rooms AS (
         SELECT cr.id AS room_id, cr.is_group, cr.name AS group_name
         FROM chat_rooms cr
         JOIN chat_room_members crm ON crm.room_id = cr.id
         WHERE crm.user_id = $1
       ),
       room_members AS (
         SELECT crm.room_id,
                json_agg(json_build_object(
                  'id', u.id,
                  'username', u.username,
                  'profilePic', u.profile_picture
                )) AS members
         FROM chat_room_members crm
         JOIN users u ON crm.user_id = u.id
         GROUP BY crm.room_id
       ),
       message_counts AS (
         SELECT room_id, COUNT(*) AS message_count
         FROM messages
         GROUP BY room_id
       )
       SELECT 
         ur.room_id,
         ur.is_group,
         ur.group_name,
         COALESCE(mc.message_count, 0) AS message_count,
         rm.members
       FROM user_rooms ur
       LEFT JOIN room_members rm ON rm.room_id = ur.room_id
       LEFT JOIN message_counts mc ON mc.room_id = ur.room_id;`,
      [userId]
    );

    const formatted = result.rows.map((row) => {
      if (row.is_group) {
        return {
          roomId: row.room_id,
          isGroup: true,
          groupName: row.group_name,
          message_count: row.message_count,
          users: row.members,
        };
      } else {
        const otherUser = row.members.find((u) => u.id !== userId);
        return {
          roomId: row.room_id,
          isGroup: false,
          message_count: row.message_count,
          user: otherUser || { id: null, username: "Unknown" },
        };
      }
    });

    res.json(formatted);
  } catch (err) {
    console.error("Failed to load chat rooms:", err.stack || err);
    res.status(500).json({ error: "Failed to load chat rooms" });
  }
});

module.exports = router;
