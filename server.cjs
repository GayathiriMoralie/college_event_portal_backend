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
const dotenv = require("dotenv");
const eventRoutes = require("./routes/eventRoutes.cjs");
const pool = require("./db.cjs"); // PostgreSQL connection

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ✅ Fix: Configure CORS properly
const corsOptions = {
  origin: "https://college-event-portal-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Handle preflight OPTIONS requests
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debugging Middleware (Remove this in production)
app.use((req, res, next) => {
  console.log(`📌 Received request: ${req.method} ${req.url}`);
  next();
});

// ✅ Test Route (Check if backend is working)
app.get("/", (req, res) => {
  res.send("✅ Hello from College Event Portal Backend!");
});

// ✅ Event Routes
app.use("/api", eventRoutes);

// ✅ Ping Route to Keep Backend Awake
app.get("/ping", (req, res) => {
  console.log("🔄 Backend Wake-up Ping Received");
  res.status(200).json({ message: "✅ Backend is awake!" });
});

// ✅ POST - Register a new participant
app.post("/api/register", async (req, res) => {
  try {
    const { Name, Email, Event, Payment_Method, Contact_No } = req.body;

    // Validate required fields
    if (!Name || !Email || !Event || !Payment_Method || !Contact_No) {
      return res.status(400).json({ error: "❌ All fields are required!" });
    }

    const query = `
      INSERT INTO registrations (Name, Email, Event, Payment_Method, Contact_No)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const values = [Name, Email, Event, Payment_Method, Contact_No];

    const result = await pool.query(query, values);
    res.status(201).json({ success: true, message: "✅ Registration successful!", data: result.rows[0] });
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// ✅ GET - Fetch All Registrations
app.get("/api/register", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id AS s_no,
        name,
        email,
        event,
        payment_method,
        contact_no,
        created_at
      FROM registrations
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching registrations:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "❌ Route not found" });
});
app.get("/favicon.ico", (req, res) => res.status(204).end()); // No content response

// Export the app for Vercel
module.exports = app;

// ✅ Start the server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

