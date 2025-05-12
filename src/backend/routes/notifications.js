const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query(
            `SELECT id, content, created_at FROM notifications
       WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC
       LIMIT 10`,
            [userId]
        );
        res.json({ notifications: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications", details: err.message });
    }
});

router.patch("/mark-read/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        await db.query(
            `UPDATE notifications
       SET is_read = true,
           expires_at = NOW() + interval '2 days'
       WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Failed to mark notifications as read:", err.message);
        res.status(500).json({ error: "Failed to mark as read" });
    }
});


module.exports = router;
