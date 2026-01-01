const mysql = require('mysql2');

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "devices_management_system",
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0
});

const promisePool = pool.promise();

promisePool.getConnection()
  .then(connection => {
    console.log('MySQL Database Connected Successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('MySQL Connection Error:', err);
  });

module.exports = promisePool;