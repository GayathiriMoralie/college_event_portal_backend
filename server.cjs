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
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

// ✅ Updated CORS Configuration
const allowedOrigins = [
    "https://college-event-portal-frontend.vercel.app",
    "https://college-event-portal-frontend.onrender.com"
];

app.use(cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// ✅ Middleware (Body Parsing)
app.use(express.json());

// ✅ PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ✅ Debugging Middleware
app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.url}`);
    console.log("📩 Request Body:", req.body);
    next();
});

// ✅ Test Database Connection on Startup
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("❌ Database connection error:", err);
    } else {
        console.log("✅ Connected to PostgreSQL at:", res.rows[0].now);
    }
});

// ✅ Login API with Role Validation Fix
app.post('/api/login', (req, res) => {
    console.log(req.body); // Debugging

    const { id, password, role } = req.body;
    const lowerRole = role.toLowerCase(); // ✅ Ensure case-insensitive comparison

    // Static users (no database)
    const users = {
        student: { id: 'student', password: '12345' },
        faculty: { id: 'faculty', password: '12345' },
    };

    if (users[lowerRole] && users[lowerRole].id === id && users[lowerRole].password === password) {
        res.status(200).json({
            success: true,
            message: '✅ Login successful!',
            user: { role: lowerRole, id },
        });
    } else {
        res.status(401).json({ error: '❌ Invalid credentials.' });
    }
});

// ✅ Registration API
// ✅ Registration API (Fixed)
app.post("/api/register", async (req, res) => {
    console.log("📩 Received Data:", req.body); // Debugging
    console.log("📩 Incoming Request Body:", req.body);


    const { name, email, event, contact_no, payment_method } = req.body;
    console.log("✅ Extracted Data:", { name, email, event, contact_no, payment_method });

    if (!name || !email || !event || !contact_no || !payment_method) {
        return res.status(400).json({ error: "❌ All fields are required!" });
    }

    try {
        const insertQuery = `
            INSERT INTO registrations (name, email, event, contact_no, payment_method)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const values = [name, email, event, contact_no, payment_method];

        const result = await pool.query(insertQuery, values);
        console.log("✅ Insert Successful:", result.rows[0]);

        res.status(201).json({
            success: true,
            message: "✅ Registration successful!",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});



// ✅ GET API to Fetch Registered Students
app.get("/api/register", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM registrations");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});



// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => {
    res.send("✅ Backend is running!");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
