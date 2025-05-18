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

    const newRoom = await pool.query(
      `INSERT INTO chat_rooms (is_group) VALUES (false) RETURNING id`
    );

    const roomId = newRoom.rows[0].id;

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
    console.error("Failed to create chat room:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }


});

router.post("/group", async (req, res) => {
  const { name, memberIds } = req.body;

  if (!name || !Array.isArray(memberIds) || memberIds.length < 2) {
    return res.status(400).json({ error: "Name and at least 2 members required" });
  }

  try {
    const newRoom = await pool.query(
      `INSERT INTO chat_rooms (is_group, name) VALUES (true, $1) RETURNING id`,
      [name]
    );
    const roomId = newRoom.rows[0].id;

    const values = memberIds.map((userId, i) => `($${i + 1}, '${roomId}')`).join(',');
    await pool.query(
      `INSERT INTO chat_room_members (user_id, room_id) VALUES ${values}`,
      memberIds
    );

    res.status(201).json({ roomId });
  } catch (err) {
    console.error("Failed to create group chat:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const roomIdResult = await pool.query(
      "SELECT room_id FROM chat_room_members WHERE user_id = $1",
      [userId]
    );

    const roomIds = roomIdResult.rows.map((r) => r.room_id);
    if (roomIds.length === 0) return res.json([]);

    const roomUsersResult = await pool.query(
      `
      SELECT 
        crm.room_id,
        cr.name AS group_name,
        cr.is_group::boolean AS is_group,
        u.id AS user_id,
        u.username,
        MAX(m.created_at) AS last_message_time
      FROM chat_room_members crm
      JOIN chat_rooms cr ON crm.room_id = cr.id
      JOIN users u ON crm.user_id = u.id
      LEFT JOIN messages m ON m.room_id = crm.room_id
      WHERE crm.room_id = ANY($1::uuid[])
      GROUP BY crm.room_id, cr.name, cr.is_group, u.id, u.username
      `,
      [roomIds]
    );

    const grouped = {};
    for (const row of roomUsersResult.rows) {
      const roomId = row.room_id;
      if (!grouped[roomId]) {
        grouped[roomId] = {
          roomId,
          isGroup: row.is_group,
          groupName: row.group_name,
          lastMessageTime: row.last_message_time,
          users: [],
        };
      }

      if (!grouped[roomId].users.find((u) => u.id === row.user_id)) {
        grouped[roomId].users.push({
          id: row.user_id,
          username: row.username,
        });
      }
    }

    const result = Object.values(grouped)
      .filter((room) => room.lastMessageTime !== null) 
      .sort((a, b) => {
        const timeA = new Date(a.lastMessageTime).getTime();
        const timeB = new Date(b.lastMessageTime).getTime();
        return timeB - timeA;
      })
      .map((room) => {
        if (!room.isGroup && room.users.length === 2) {
          const otherUser = room.users.find((u) => u.id !== userId);
          return {
            roomId: room.roomId,
            isGroup: false,
            user: otherUser,
            lastMessageTime: room.lastMessageTime,
          };
        } else {
          return {
            roomId: room.roomId,
            isGroup: true,
            groupName: room.groupName,
            users: room.users,
            lastMessageTime: room.lastMessageTime,
          };
        }
      });


    res.json(result);
  } catch (err) {
    console.error("Error in GET /chat-rooms/:userId:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/room/:roomId/members", async (req, res) => {
  const { roomId } = req.params;

  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.name, u.profile_pic
      FROM chat_room_members crm
      JOIN users u ON crm.user_id = u.id
      WHERE crm.room_id = $1
    `, [roomId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to get room members:", err);
    res.status(500).json({ error: "Failed to get members" });
  }
});


module.exports = router;
