import { jest } from "@jest/globals";
import axiosMock from "./mocks/axiosMocks.js";
jest.unstable_mockModule("axios", () => axiosMock);
// ✅ Mock axios safely inside jest.mock()

// ✅ Use top-level await to import mocked axios
const axios = (await import("axios")).default;


import request from "supertest";
import app from "../src/app.js";
import db from "../src/db/db.js";
// import axios from "axios";


beforeAll(async () => {
  await db.migrate.latest?.(); // if you use migrations
});

afterAll(async () => {
  await db.destroy();
});

beforeEach(async () => {
  await db("countries").del(); // clear DB before each test
});

describe("🌍 Country API Endpoints", () => {
  test("POST /countries/refresh → should fetch and store countries", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("restcountries")) {
        return Promise.resolve({
          data: [
            {
              name: "Nigeria",
              capital: "Abuja",
              region: "Africa",
              population: 200000000,
              flag: "https://flagcdn.com/ng.svg",
              currencies: [{ code: "NGN" }],
            },
            {
              name: "Ghana",
              capital: "Accra",
              region: "Africa",
              population: 30000000,
              flag: "https://flagcdn.com/gh.svg",
              currencies: [{ code: "GHS" }],
            },
          ],
        });
      }
      if (url.includes("open.er-api")) {
        return Promise.resolve({
          data: { rates: { NGN: 1600, GHS: 15, USD: 1 } },
        });
      }
    });

    const res = await request(app).post("/countries/refresh");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/successfully/i);

    const allCountries = await db("countries").select("*");
    expect(allCountries.length).toBeGreaterThanOrEqual(2);
  });

  test("GET /countries → should return all countries", async () => {
    await seedTestCountries();

    const res = await request(app).get("/countries");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("name");
  });

  test("GET /countries?region=Africa → filters by region", async () => {
    await seedTestCountries();

    const res = await request(app).get("/countries?region=Africa");
    expect(res.status).toBe(200);
    expect(res.body.every((c) => c.region === "Africa")).toBe(true);
  });

  test("GET /countries/Nigeria → returns specific country", async () => {
    await seedTestCountries();

    const res = await request(app).get("/countries/Nigeria");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Nigeria");
  });

  test("GET /status → shows total countries and last refresh timestamp", async () => {
    await seedTestCountries();

    const res = await request(app).get("/status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("total_countries");
    expect(res.body).toHaveProperty("last_refreshed_at");
  });

  test("GET /countries/image → generates PNG summary image", async () => {
    await seedTestCountries();

    const res = await request(app).get("/countries/image");
    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch(/image\/png/);
  });

  test("DELETE /countries/:name → removes a country", async () => {
    await seedTestCountries();

    const res = await request(app).delete("/countries/Nigeria");
    expect(res.status).toBe(204);

    const exists = await db("countries").where({ name: "Nigeria" }).first();
    expect(exists).toBeUndefined();
  });

  test("DELETE /countries/:name → returns 404 if not found", async () => {
    const res = await request(app).delete("/countries/Atlantis");
    expect(res.status).toBe(404);
  });
});

// Helper to seed DB for tests
async function seedTestCountries() {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  await db("countries").insert([
    {
      name: "Nigeria",
      capital: "Abuja",
      region: "Africa",
      population: 200000000,
      currency_code: "NGN",
      exchange_rate: 1600,
      estimated_gdp: 200000000 / 1600,
      flag_url: "https://flagcdn.com/ng.svg",
      last_refreshed_at: now,
    },
    {
      name: "Ghana",
      capital: "Accra",
      region: "Africa",
      population: 30000000,
      currency_code: "GHS",
      exchange_rate: 15,
      estimated_gdp: 30000000 / 15,
      flag_url: "https://flagcdn.com/gh.svg",
      last_refreshed_at: now,
    },
  ]);
}
