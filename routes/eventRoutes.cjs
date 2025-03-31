const express = require("express");
const router = express.Router();
const pool = require("../db.cjs"); // PostgreSQL database connection

// ✅ Get all events
router.get("/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.status(200).json({
      success: true,
      events: result.rows,
    });
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// ✅ Get event by ID
router.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found!" });
    }

    res.status(200).json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error fetching event by ID:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// ✅ Create a new event
router.post("/events", async (req, res) => {
  try {
    const { name, description, date, venue, organizer } = req.body;

    if (!name || !description || !date || !venue || !organizer) {
      return res.status(400).json({ error: "❌ All fields are required!" });
    }

    const query = `
      INSERT INTO events (name, description, date, venue, organizer)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const values = [name, description, date, venue, organizer];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "✅ Event created successfully!",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// ✅ Update an event
router.put("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, date, venue, organizer } = req.body;

    if (!name || !description || !date || !venue || !organizer) {
      return res.status(400).json({ error: "❌ All fields are required!" });
    }

    const query = `
      UPDATE events 
      SET name = $1, description = $2, date = $3, venue = $4, organizer = $5
      WHERE id = $6 RETURNING *;
    `;
    const values = [name, description, date, venue, organizer, id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found!" });
    }

    res.status(200).json({
      success: true,
      message: "✅ Event updated successfully!",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating event:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// ✅ Delete an event
router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM events WHERE id = $1 RETURNING *;";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found!" });
    }

    res.status(200).json({
      success: true,
      message: "✅ Event deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

module.exports = router;
