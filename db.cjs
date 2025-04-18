// const mysql = require('mysql2'); // Import mysql2 package

// // Create a connection to the MySQL database
// const db = mysql.createConnection({
//   host: 'localhost',            // MySQL host (localhost in XAMPP)
//   user: 'root',                 // MySQL username (default is 'root' in XAMPP)
//   password: '',                 // MySQL password (empty by default in XAMPP)
//   database: 'college_event_portal' // Name of the database in XAMPP
// });

// // Test the connection to the database
// db.connect((err) => {
//   if (err) {
//     console.error('Database connection failed: ' + err.message); // Connection failure message
//     process.exit(1); // Exit the process if the connection fails
//   } else {
//     console.log('Connected to the MySQL database.'); // Success message
//   }
// });

// // Export the connection so it can be used in other files (like eventRoutes.js)
// module.exports = db;


// const mysql = require('mysql2'); // Import mysql2 package

// // Database connection configuration
// const dbConfig = {
//   host: 'localhost',            // MySQL host (localhost in XAMPP)
//   user: 'root',                 // MySQL username (default is 'root' in XAMPP)
//   password: '',                 // MySQL password (empty by default in XAMPP)
//   database: 'college_event_portal', // Name of the database in XAMPP
//   waitForConnections: true,
//   connectionLimit: 10,           // Limit number of connections
//   queueLimit: 0
// };

// // Create a connection pool
// const pool = mysql.createPool(dbConfig);

// // Function to test database connection
// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('Database connection failed:', err.message);
//     process.exit(1); // Exit the process if the connection fails
//   } else {
//     console.log('Connected to the MySQL database.');
//     connection.release(); // Release connection back to the pool
//   }
// });

// // Export the pool so it can be used in other files
// module.exports = pool;


const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // ✅ Use DATABASE_URL
  ssl: { rejectUnauthorized: false },  // ✅ Required for NeonDB & Render
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Connected to Database at:", res.rows[0].now);
  }
});

module.exports = pool;



