const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const pool = require("../db.cjs"); // PostgreSQL DB connection

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure 'uploads/' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// ✅ Middleware to check user role (Temporary - Implement Proper Auth)
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Permission denied: Insufficient privileges" });
    }
    next();
  };
};

// ✅ Get all events
router.get("/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get a single event by ID
router.get("/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Create a new event (Only for faculty)
router.post("/events", checkRole("faculty"), upload.single("eventImage"), async (req, res) => {
  const { name, description, date, location, created_by, event_fees } = req.body;
  const eventImage = req.file ? req.file.filename : null;

  if (!name || !date || !location || !created_by) {
    return res.status(400).json({ error: "Missing required fields (name, date, location, created_by)" });
  }

  try {
    const query = `
      INSERT INTO events (name, description, date, location, created_by, event_fees, image) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
    
    const result = await pool.query(query, [name, description, date, location, created_by, event_fees || 0, eventImage]);
    res.status(201).json({ message: "Event created successfully", eventId: result.rows[0].id });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Register a student for an event
router.post("/register", async (req, res) => {
  const { Name, Email, Event, Payment_Method, Contact_No } = req.body;

  if (!Name || !Email || !Event || !Payment_Method || !Contact_No) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO registrations (Name, Email, Event, Payment_Method, Contact_No, created_at) 
      VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`;

    const result = await pool.query(query, [Name, Email, Event, Payment_Method, Contact_No]);

    res.status(201).json({ message: "Registration successful", registrationId: result.rows[0].id });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Fetch all registered students (Faculty View)

router.get("/studentsregistered", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id AS s_no, 
        Name, 
        Email, 
        event, 
        payment_method, 
        Contact_No, 
        created_at
      FROM registrations 
      ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching registered students:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
