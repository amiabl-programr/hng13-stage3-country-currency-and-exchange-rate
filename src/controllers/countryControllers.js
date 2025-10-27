import { db } from '../db/db.js';

export async function getCountries(req, res) {
  // Function implementation
  console.log("hi")
  try {
    const [rows] = await db.query('SELECT * FROM countries');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
}

export async function generateStatus(req, res) {
  // Function implementation
  console.log("Creating country...");
  const [rows] = await db.query('SELECT COUNT(*) as total FROM countries');
  res.json({ total_countries: rows[0].total });
}
export function createCountry(req, res) {
  // Function implementation
console.log("Creating country...");
}

export function deleteCountry(req, res) {
  // Function implementation
  const {name} = req.params;

//   check if country exists in the database

}