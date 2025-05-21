const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/communities
router.get("/", async (req, res) => {
    console.log("GET /api/communities hit");
    try {
        const result = await db.query("SELECT * FROM communities ORDER BY name");
        console.log("Sending JSON:", result.rows);
        res.json({ communities: result.rows });
    } catch (err) {
        console.error("Error fetching communities:", err);
        res.status(500).json({ error: "Failed to fetch communities" });
    }
});

// POST /api/users/:userId/communities
router.post("/users/:userId/communities", async (req, res) => {
    const { communityId } = req.body;
    const { userId } = req.params;

    try {
        await db.query(
            `INSERT INTO user_communities (user_id, community_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
            [userId, communityId]
        );
        res.status(200).json({ message: "Joined community" });
    } catch (err) {
        console.error("Join community error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/users/:userId/communities
router.get("/:userId/communities", async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            `SELECT c.* FROM communities c
       JOIN user_communities uc ON uc.community_id = c.id
       WHERE uc.user_id = $1`,
            [userId]
        );

        res.json({ communities: result.rows });
    } catch (err) {
        console.error("Error fetching user's communities:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});





module.exports = router;
