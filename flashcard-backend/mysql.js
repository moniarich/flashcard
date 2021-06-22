const mysql = require("mysql2");
// create the pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "flashcard",
  password: "helloworld",
  port: 3308,
});
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();

module.exports = promisePool;
