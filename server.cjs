// // Import required modules
// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const eventRoutes = require("./routes/eventRoutes");
// const db = require("./db");

// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();

// // Middleware
// app.use(cors({ origin: "http://localhost:3001", credentials: true })); // CORS policy
// app.use(express.json()); // Parse JSON request bodies
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data


// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   console.log("Received request:", req.method, req.url);
//   console.log("Request body:", req.body);
//   next();
// });


// // Test route
// app.get("/", (req, res) => {
//   res.send("Hello World from College Event Portal!");
// });

// // Event routes
// app.use("/api", eventRoutes);

// // Registration route
// app.post("/api/register", (req, res) => {
//   console.log("Received data:", req.body); // Debugging line

//   const { name, email, event, payment, contact } = req.body;

//   if (!name || !email || !event || !payment || !contact) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const query = "INSERT INTO registrations (name, email, event, payment, contact) VALUES (?, ?, ?, ?, ?)";
//   db.query(query, [name, email, event, payment, contact], (err, result) => {
//     if (err) {
//       console.error("Error saving registration data:", err);
//       return res.status(500).json({ message: "Error saving registration data." });
//     }
//     res.status(200).json({ message: "Registration successful! Ready for the competition soon!!" });
//   });
// });

// // Event routes
// app.use("/api", eventRoutes);
// // Start the server
// const PORT = process.env.PORT || 8001;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });





// Import required modules
// const express = require("express"); 
// const cors = require("cors");
// const dotenv = require("dotenv");
// const eventRoutes = require("./routes/eventRoutes.cjs");
// const db = require("./db.cjs");

// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();

// // Middleware
// app.use(cors({ origin: "http://localhost:3001", credentials: true })); // CORS policy

// app.use(express.json()); // Parse JSON request bodies
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// // Debugging middleware (Can be removed later)
// app.use((req, res, next) => {
//   console.log("Received request:", req.method, req.url);
//   console.log("Request body:", req.body);
//   next();
// });

// // Test route
// app.get("/", (req, res) => {
//   res.send("Hello World from College Event Portal!");
// });

// // Event routes
// app.use("/api", eventRoutes);

// // Registration route (POST - to insert a new registration)
// app.post("/api/register", (req, res) => {
//   console.log("Received data:", req.body); // Debugging line

//   const { Name, Email, Event, Payment_Method, Contact_No } = req.body; // Updated variable names

//   if (!Name || !Email || !Event || !Payment_Method || !Contact_No) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const query = "INSERT INTO registrations (Name, Email, Event, Payment_Method, Contact_No) VALUES (?, ?, ?, ?, ?)";
//   db.query(query, [Name, Email, Event, Payment_Method, Contact_No], (err, result) => {
//     if (err) {
//       console.error("Error saving registration data:", err);
//       return res.status(500).json({ message: "Error saving registration data." });
//     }
//     res.status(201).json({ message: "Registration successful!", registrationId: result.insertId });
//   });
// });

// // Fetch all registrations (GET - to retrieve all registered users)
// app.get("/api/register", (req, res) => {
//   const query = "SELECT * FROM registrations"; // Fetching all data from MySQL
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching registrations:", err);
//       return res.status(500).json({ message: "Server error" });
//     }
//     res.json(results);
//   });
// });

// // Start the server
// const PORT = process.env.PORT || 8001;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

// ✅ Fix: Allow CORS for frontend URL
const allowedOrigins = ["https://college-event-portal-frontend.vercel.app"]; // Update this if frontend URL changes
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
  })
);

// Middleware
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ✅ Fix: Log incoming requests (for debugging)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// Route to register student
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, event, payment_method, contact_no } = req.body;

    if (!name || !email || !event || !contact_no) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const insertQuery = `
      INSERT INTO registrations (name, email, event, payment_method, contact_no)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const values = [name, email, event, payment_method, contact_no];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({ message: "Registration successful", data: result.rows[0] });
  } catch (error) {
    console.error("🛑 Database Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
