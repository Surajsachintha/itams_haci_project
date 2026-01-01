const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "devices_management_system"
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected!');
});

module.exports = db;
