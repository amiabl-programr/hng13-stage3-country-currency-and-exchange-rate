import knex from "knex";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // ✅ SSL goes inside the connection block (not outside)
    ssl: {
      rejectUnauthorized: false, // safer for Aiven default SSL cert
      // Optional: if you downloaded your Aiven CA cert, use this line instead:
      // ca: fs.readFileSync("./aiven-ca.pem")
    },
  },
  pool: { min: 0, max: 10 },
});

export default db;
