const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Your PostgreSQL connection

//  Create a new event
router.post("/add", async (req, res) => {
    const { title, description, location, event_date, user_id, latitude, longitude } = req.body;

    console.log("Incoming Event Payload:", req.body);

    try {
        const result = await db.query(
            `INSERT INTO events (title, description, location, event_date, user_id, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [title, description, location, event_date, user_id, latitude, longitude]
        );

        res.status(201).json({ message: "Event created", event: result.rows[0] });
    } catch (err) {
        console.error("❌ Event creation failed:", err);
        console.error("🔥 Stack trace:", err.stack);
        res.status(500).json({ error: "Failed to create event", details: err.message });
    }
});

// Get all events
router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM events ORDER BY event_date ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Failed to fetch events:", err.message);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// Get events by user ID
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query(
            "SELECT * FROM events WHERE user_id = $1 ORDER BY event_date ASC",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Failed to fetch user events:", err.message);
        res.status(500).json({ error: "Failed to fetch user events" });
    }
});

//Deleting an event
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM events WHERE id = $1", [id]);
      res.json({ message: "Event deleted" });
    } catch (err) {
      console.error("Failed to delete event:", err.message);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });
  

module.exports = router;