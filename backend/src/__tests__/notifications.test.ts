import request from "supertest";
import { createApp } from "./app";
import { mockQuery } from "../__mocks__/db";

const app = createApp();

beforeEach(() => jest.clearAllMocks());

// ── GET /api/notifications ─────────────────────────────────────────────────────
describe("GET /api/notifications", () => {
  it("returns notifications with unread count", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          text: "Deploy OK",
          time_label: "5 min ago",
          severity: "info",
          is_read: true,
        },
        {
          id: 2,
          text: "High CPU",
          time_label: "10 min ago",
          severity: "warning",
          is_read: false,
        },
      ],
    });

    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(200);
    expect(res.body.notifications).toHaveLength(2);
    expect(res.body.unreadCount).toBe(1);
  });

  it("returns empty notifications with unreadCount 0", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(200);
    expect(res.body.notifications).toHaveLength(0);
    expect(res.body.unreadCount).toBe(0);
  });
});

// ── POST /api/notifications ────────────────────────────────────────────────────
describe("POST /api/notifications", () => {
  it("creates a notification", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 11 }] });

    const res = await request(app).post("/api/notifications").send({
      text: "Service restored",
      time: "2 min ago",
      severity: "info",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(11);
  });

  it("returns 400 when severity is missing", async () => {
    const res = await request(app).post("/api/notifications").send({
      text: "Oops",
      time: "now",
    });
    expect(res.status).toBe(400);
  });
});
