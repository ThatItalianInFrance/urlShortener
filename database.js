const mysql = require('mysql2');
require('dotenv').config({ path: './.env.local', quiet: true });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// module.exports = db;

module.exports = {
  query: (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) {
          reject(err); // Handle errors
        } else {
          resolve(results); // Return results
        }
      });
    });
  }
};