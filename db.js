const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "phishing_simulation",
  password: "12345",
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

module.exports = pool;