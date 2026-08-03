const request = require("supertest");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.ENABLE_LIVE_SIMULATOR = "false";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fleetdash_test";

describe("Health endpoint", () => {
  let app;

  beforeAll(() => {
    ({ app } = require("../server"));
  });

  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
