const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Send a friend request
router.post('/request', async (req, res) => {
    const { senderId, receiverId } = req.body;

    if (senderId === receiverId)
        return res.status(400).json({ message: "You cannot add yourself." });

    try {
        const existing = await db.query(
            `SELECT * FROM friend_requests 
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)`,
            [senderId, receiverId]
        );

        if (existing.rows.length > 0)
            return res.status(409).json({ message: "Request already exists." });

        await db.query(
            `INSERT INTO friend_requests (id, sender_id, receiver_id, status) 
       VALUES ($1, $2, $3, 'pending')`,
            [uuidv4(), senderId, receiverId]
        );

        res.status(201).json({ message: "Friend request sent." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send request." });
    }
});

// Get current friends
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query(
            `SELECT * FROM friend_requests 
       WHERE (sender_id = $1 OR receiver_id = $1) 
         AND status = 'accepted'`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch friends." });
    }
});

// Get incoming friend requests
router.get('/requests/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query(
            `SELECT * FROM friend_requests 
       WHERE receiver_id = $1 AND status = 'pending'`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch requests." });
    }
});

// Accept a friend request
router.post('/accept/:requestId', async (req, res) => {
    const { requestId } = req.params;

    try {
        const result = await db.query(
            `UPDATE friend_requests 
       SET status = 'accepted', updated_at = NOW() 
       WHERE id = $1 RETURNING *`,
            [requestId]
        );

        if (result.rowCount === 0)
            return res.status(404).json({ message: "Request not found." });

        res.status(200).json({ message: "Friend request accepted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to accept request." });
    }
});

// Remove friend or delete request
router.delete('/:requestId', async (req, res) => {
    const { requestId } = req.params;

    try {
        const result = await db.query(
            `DELETE FROM friend_requests WHERE id = $1 RETURNING *`,
            [requestId]
        );

        if (result.rowCount === 0)
            return res.status(404).json({ message: "Request not found." });

        res.status(200).json({ message: "Friend removed or request deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to remove friend." });
    }
});

module.exports = router;
