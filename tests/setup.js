import knex from "knex";
import knexConfig from "../knexfile.js";
import db from "../src/db/db.js";

// Use SQLite in-memory DB for all tests
beforeAll(async () => {
  const testDb = knex(knexConfig.test);
  await testDb.migrate.latest();
  db.client = testDb.client; // replace connection
  db.connection = testDb.connection;
});

afterAll(async () => {
  await db.destroy();
});
