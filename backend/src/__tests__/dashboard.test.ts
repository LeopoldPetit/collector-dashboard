import request from "supertest";
import { createApp } from "./app";
import { mockQuery } from "../__mocks__/db";

const app = createApp();

beforeEach(() => jest.clearAllMocks());

// ── GET /api/dashboard/overview ────────────────────────────────────────────────
describe("GET /api/dashboard/overview", () => {
  it("returns a complete dashboard overview", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            title: "Uptime",
            value: "99.9",
            unit: "%",
            status: "ok",
            trend: "0.1",
            description: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ time_label: "08:00", requests: 400 }],
      })
      .mockResolvedValueOnce({
        rows: [{ day_label: "Mon", deploys: 5, failures: 0 }],
      })
      .mockResolvedValueOnce({
        rows: [{ label: "Deploy #42", time_label: "1h ago", severity: "info" }],
      });

    const res = await request(app).get("/api/dashboard/overview");
    expect(res.status).toBe(200);
    expect(res.body.kpis[0].title).toBe("Uptime");
    expect(res.body.kpis[0].value).toBe(99.9);
    expect(res.body.kpis[0].trend).toBe(0.1);
    expect(res.body.requestVolume[0].time).toBe("08:00");
    expect(res.body.weeklyDeploys[0].day).toBe("Mon");
    expect(res.body.recentActivity[0].severity).toBe("info");
  });
});

// ── POST /api/dashboard/kpis ───────────────────────────────────────────────────
describe("POST /api/dashboard/kpis", () => {
  it("creates a dashboard KPI record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 15 }] });

    const res = await request(app).post("/api/dashboard/kpis").send({
      title: "Error Rate",
      value: 0.02,
      unit: "%",
      status: "ok",
      trend: -0.5,
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(15);
  });

  it("returns 400 when status is missing", async () => {
    const res = await request(app)
      .post("/api/dashboard/kpis")
      .send({ title: "X", value: 1 });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/dashboard/request-volume ────────────────────────────────────────
describe("POST /api/dashboard/request-volume", () => {
  it("creates a request volume record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 3 }] });

    const res = await request(app)
      .post("/api/dashboard/request-volume")
      .send({ time: "09:00", requests: 500 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(3);
  });

  it("returns 400 when requests is missing", async () => {
    const res = await request(app)
      .post("/api/dashboard/request-volume")
      .send({ time: "09:00" });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/dashboard/weekly-deploys ────────────────────────────────────────
describe("POST /api/dashboard/weekly-deploys", () => {
  it("creates a weekly deploy record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 7 }] });

    const res = await request(app)
      .post("/api/dashboard/weekly-deploys")
      .send({ day: "Tue", deploys: 4, failures: 1 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(7);
  });
});

// ── POST /api/dashboard/activity ──────────────────────────────────────────────
describe("POST /api/dashboard/activity", () => {
  it("creates a recent activity record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 20 }] });

    const res = await request(app).post("/api/dashboard/activity").send({
      label: "Deploy #43",
      time: "5 min ago",
      severity: "success",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(20);
  });

  it("returns 400 when label is missing", async () => {
    const res = await request(app)
      .post("/api/dashboard/activity")
      .send({ time: "now", severity: "info" });
    expect(res.status).toBe(400);
  });
});
