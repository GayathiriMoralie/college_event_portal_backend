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

const connectionString = process.env.DATABASE_URL;

// Ensure SSL settings for Neon or other hosted databases
const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : false,
});

// Check connection and log errors
pool.connect()
  .then(client => {
    return client.query("SELECT current_database();")
      .then(res => {
        console.log(`✅ Connected to PostgreSQL Database: ${res.rows[0].current_database}`);
        client.release();
      })
      .catch(err => {
        console.error("❌ Error fetching database name:", err.message);
        client.release();
      });
  })
  .catch(err => {
    console.error("❌ PostgreSQL Connection Error:", err.message);
    process.exit(1);
  });

module.exports = pool;
