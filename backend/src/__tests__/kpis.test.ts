import request from "supertest";
import { createApp } from "./app";
import { mockQuery } from "../__mocks__/db";

const app = createApp();

beforeEach(() => jest.clearAllMocks());

// ── GET /api/kpis/summary ──────────────────────────────────────────────────────
describe("GET /api/kpis/summary", () => {
  it("returns a formatted kpi summary", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            generated_at: "2026-05-01T00:00:00Z",
            period: "Q1 2026",
            company: "StreamFlow",
            global_status: "ok",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            summary_id: 1,
            domain: "technical",
            metric_key: "uptime",
            value: "99.9",
            unit: "%",
            status: "ok",
            threshold: "99",
          },
          {
            summary_id: 1,
            domain: "business",
            metric_key: "churnRate",
            value: "0.87",
            unit: "%",
            status: "ok",
            threshold: null,
          },
        ],
      });

    const res = await request(app).get("/api/kpis/summary");
    expect(res.status).toBe(200);
    expect(res.body.globalStatus).toBe("ok");
    expect(res.body.period).toBe("Q1 2026");
    expect(res.body.technical.uptime.value).toBe(99.9);
    expect(res.body.technical.uptime.threshold).toBe(99);
    expect(res.body.business.churnRate.threshold).toBeUndefined();
  });
});

// ── POST /api/kpis/summary ─────────────────────────────────────────────────────
describe("POST /api/kpis/summary", () => {
  const validBody = {
    generatedAt: "2026-05-07T00:00:00Z",
    period: "Q2 2026",
    company: "StreamFlow",
    globalStatus: "ok",
    metrics: [
      {
        domain: "technical",
        metricKey: "uptime",
        value: 99.9,
        unit: "%",
        status: "ok",
        threshold: 99,
      },
    ],
  };

  it("creates a kpi summary with metrics", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 3 }] }) // INSERT kpi_summary
      .mockResolvedValueOnce({ rows: [] }); // INSERT kpi_metrics

    const res = await request(app).post("/api/kpis/summary").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(3);
    expect(res.body.metricsInserted).toBe(1);
  });

  it("returns 400 when metrics is missing", async () => {
    const { metrics, ...body } = validBody;
    const res = await request(app).post("/api/kpis/summary").send(body);
    expect(res.status).toBe(400);
  });

  it("returns 400 when globalStatus is missing", async () => {
    const { globalStatus, ...body } = validBody;
    const res = await request(app).post("/api/kpis/summary").send(body);
    expect(res.status).toBe(400);
  });
});
