import request from "supertest";
import { createApp } from "./app";
import { mockQuery } from "../__mocks__/db";

const app = createApp();

beforeEach(() => jest.clearAllMocks());

// ── GET /api/technical/overview ────────────────────────────────────────────────
describe("GET /api/technical/overview", () => {
  it("returns a formatted technical overview", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          total_requests: "1200000",
          error_requests: "240",
          error_rate: "0.02",
          uptime_total_hours: "720",
          uptime_downtime_h: "2.5",
          uptime_percent: "99.65",
          mttr_avg_hours: "1.2",
          rt_average_ms: 145,
          rt_p95_ms: 320,
        },
      ],
    });

    const res = await request(app).get("/api/technical/overview");
    expect(res.status).toBe(200);
    expect(res.body.totalRequests).toBe(1200000);
    expect(res.body.errorRate).toBe(0.02);
    expect(res.body.uptime.uptimePercent).toBe(99.65);
    expect(res.body.mttr.averageHours).toBe(1.2);
    expect(res.body.responseTimes.average).toBe(145);
  });
});

// ── GET /api/technical/incidents ───────────────────────────────────────────────
describe("GET /api/technical/incidents", () => {
  it("returns incidents list with summary", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            title: "DB outage",
            duration_hours: "2.5",
            duration_minutes: 150,
            severity: "critical",
            status: "resolved",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            total: 1,
            total_downtime_hours: "2.5",
            mttr_hours: "2.5",
            period_days: 30,
          },
        ],
      });

    const res = await request(app).get("/api/technical/incidents");
    expect(res.status).toBe(200);
    expect(res.body.incidents).toHaveLength(1);
    expect(res.body.incidents[0].severity).toBe("critical");
    expect(res.body.summary.mttrHours).toBe(2.5);
  });
});

// ── GET /api/technical/response-times ──────────────────────────────────────────
describe("GET /api/technical/response-times", () => {
  it("returns samples and stats", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          { sample_index: 0, ms: 100 },
          { sample_index: 1, ms: 200 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            min_ms: 80,
            max_ms: 500,
            average_ms: 145,
            p50_ms: 130,
            p90_ms: 300,
            p95_ms: 400,
          },
        ],
      });

    const res = await request(app).get("/api/technical/response-times");
    expect(res.status).toBe(200);
    expect(res.body.samples).toHaveLength(2);
    expect(res.body.stats.p95).toBe(400);
  });
});

// ── POST /api/technical/overview ───────────────────────────────────────────────
describe("POST /api/technical/overview", () => {
  const validBody = {
    totalRequests: 1000000,
    errorRequests: 200,
    errorRate: 0.02,
    uptimeTotalHours: 720,
    uptimeDowntimeHours: 3,
    uptimePercent: 99.58,
    mttrAvgHours: 1.5,
    rtAverageMs: 140,
    rtP95Ms: 310,
  };

  it("creates a technical overview record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] });

    const res = await request(app)
      .post("/api/technical/overview")
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(42);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/technical/overview")
      .send({ totalRequests: 1 });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/technical/incidents ──────────────────────────────────────────────
describe("POST /api/technical/incidents", () => {
  it("creates an incident", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 7 }] });

    const res = await request(app).post("/api/technical/incidents").send({
      title: "Network flap",
      durationHours: 0.5,
      durationMinutes: 30,
      severity: "minor",
      status: "resolved",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(7);
  });

  it("returns 400 when severity is missing", async () => {
    const res = await request(app).post("/api/technical/incidents").send({
      title: "X",
      durationHours: 1,
      durationMinutes: 60,
      status: "open",
    });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/technical/response-times ─────────────────────────────────────────
describe("POST /api/technical/response-times", () => {
  it("inserts stats and samples", async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post("/api/technical/response-times")
      .send({
        samples: [
          { index: 0, ms: 100 },
          { index: 1, ms: 200 },
        ],
        stats: {
          min: 80,
          max: 300,
          average: 150,
          p50: 130,
          p90: 250,
          p95: 280,
        },
      });
    expect(res.status).toBe(201);
    expect(res.body.inserted).toBe(2);
  });

  it("returns 400 when samples is missing", async () => {
    const res = await request(app)
      .post("/api/technical/response-times")
      .send({
        stats: {
          min: 80,
          max: 300,
          average: 150,
          p50: 130,
          p90: 250,
          p95: 280,
        },
      });
    expect(res.status).toBe(400);
  });
});
