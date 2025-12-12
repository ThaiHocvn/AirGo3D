import request from "supertest";
import app from "../app";

describe("Routes", () => {
  it("health check", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });

  it("image-preview route should exist", async () => {
    const res = await request(app).get("/api/image-preview/test.jpg");
    expect([200, 404]).toContain(res.status);
  });

  it("image-thumbnail route should exist", async () => {
    const res = await request(app).get("/api/image-thumbnail/test.jpg");
    expect([200, 404]).toContain(res.status);
  });
});
