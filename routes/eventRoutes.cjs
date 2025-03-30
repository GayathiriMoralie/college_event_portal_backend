const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../db.cjs'); // Connects to MySQL database

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware to check user role (Replace with proper authentication later)
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Permission denied: Insufficient privileges' });
    }
    next();
  };
};

// Get all events
router.get('/events', (req, res) => {
  db.query('SELECT * FROM events ORDER BY date DESC', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// Get a single event by ID
router.get('/events/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM events WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(results[0]);
  });
});

// Create a new event with image upload (Only for faculty)
router.post('/events', checkRole('faculty'), upload.single('eventImage'), (req, res) => {
  const { name, description, date, location, created_by, event_fees } = req.body;
  const eventImage = req.file ? req.file.filename : null;

  if (!name || !date || !location || !created_by) {
    return res.status(400).json({ error: 'Missing required fields (name, date, location, created_by)' });
  }

  const query = 'INSERT INTO events (name, description, date, location, created_by, event_fees, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [name, description, date, location, created_by, event_fees || 0, eventImage], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(201).json({ message: 'Event created successfully', eventId: results.insertId });
  });
});

// Update an event with image upload (Only for faculty)
router.put('/events/:id', checkRole('faculty'), upload.single('eventImage'), (req, res) => {
  const { id } = req.params;
  const { name, description, date, location, event_fees } = req.body;
  const eventImage = req.file ? req.file.filename : null;

  if (!name || !date || !location) {
    return res.status(400).json({ error: 'Missing required fields (name, date, location)' });
  }

  const query = 'UPDATE events SET name = ?, description = ?, date = ?, location = ?, event_fees = ?, image = ? WHERE id = ?';
  db.query(query, [name, description, date, location, event_fees || 0, eventImage, id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully' });
  });
});

// Delete an event (Only for faculty)
router.delete('/events/:id', checkRole('faculty'), (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM events WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
});

// Register a student for an event
router.post('/register', (req, res) => {
  const { Name, Email, Event, Payment_Method, Contact_No } = req.body;

  if (!Name || !Email || !Event || !Payment_Method || !Contact_No) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO registrations (Name, Email, Event, Payment_Method, Contact_No) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [Name, Email, Event, Payment_Method, Contact_No], (err, result) => {
    if (err) {
      console.error('Database error:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Internal server error', details: err.sqlMessage || err });
    }
    res.status(201).json({ message: 'Registration successful', registrationId: result.insertId });
  });
});

module.exports = router;
