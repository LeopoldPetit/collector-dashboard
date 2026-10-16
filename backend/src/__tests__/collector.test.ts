import request from "supertest";
import { createApp } from "./app";
import { mockQuery } from "../__mocks__/db";
import { statusFor } from "../routes/collector";

const app = createApp();
const TOKEN = "test-ingest-token";

beforeEach(() => {
  jest.clearAllMocks();
  process.env.INGEST_TOKEN = TOKEN;
});

afterAll(() => {
  delete process.env.INGEST_TOKEN;
});

const validBody = {
  service: "catalog-api",
  commitSha: "abc1234",
  pipelineRun: "42",
  metrics: [
    { category: "quality", name: "coverage.lines", value: 85.2, unit: "%" },
    { category: "security", name: "trivy.critical", value: 0 },
  ],
};

// ── statusFor ────────────────────────────────────────────────────────────────
describe("statusFor", () => {
  it("evaluates coverage thresholds", () => {
    expect(statusFor("coverage.lines", 85)).toBe("ok");
    expect(statusFor("coverage.lines", 70)).toBe("warning");
    expect(statusFor("coverage.lines", 40)).toBe("critical");
  });

  it("evaluates zero-tolerance metrics", () => {
    expect(statusFor("trivy.critical", 0)).toBe("ok");
    expect(statusFor("trivy.critical", 2)).toBe("critical");
    expect(statusFor("trivy.high", 3)).toBe("warning");
  });

  it("returns info for metrics without a rule", () => {
    expect(statusFor("sonar.code_smells", 12)).toBe("info");
  });
});

// ── POST /api/collector/metrics ──────────────────────────────────────────────
describe("POST /api/collector/metrics", () => {
  it("returns 503 when INGEST_TOKEN is not configured", async () => {
    delete process.env.INGEST_TOKEN;
    const res = await request(app)
      .post("/api/collector/metrics")
      .set("X-Ingest-Token", TOKEN)
      .send(validBody);
    expect(res.status).toBe(503);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 401 when the token is missing or wrong", async () => {
    const missing = await request(app)
      .post("/api/collector/metrics")
      .send(validBody);
    expect(missing.status).toBe(401);

    const wrong = await request(app)
      .post("/api/collector/metrics")
      .set("X-Ingest-Token", "nope")
      .send(validBody);
    expect(wrong.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("inserts all metric points in one query", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/collector/metrics")
      .set("X-Ingest-Token", TOKEN)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.inserted).toBe(2);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("INSERT INTO collector_metric_points");
    expect(params).toHaveLength(14);
    expect(params[0]).toBe("catalog-api");
    expect(params[2]).toBe("coverage.lines");
    expect(params[3]).toBe(85.2);
    expect(params[5]).toBe("abc1234");
  });

  it("returns 400 when service is missing", async () => {
    const res = await request(app)
      .post("/api/collector/metrics")
      .set("X-Ingest-Token", TOKEN)
      .send({ metrics: validBody.metrics });
    expect(res.status).toBe(400);
  });

  it("returns 400 when a metric value is not a finite number", async () => {
    const res = await request(app)
      .post("/api/collector/metrics")
      .set("X-Ingest-Token", TOKEN)
      .send({
        service: "frontend",
        metrics: [{ category: "tests", name: "tests.passed", value: "17" }],
      });
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when category is unknown", async () => {
    const res = await request(app)
      .post("/api/collector/metrics")
      .set("X-Ingest-Token", TOKEN)
      .send({
        service: "frontend",
        metrics: [{ category: "other", name: "x", value: 1 }],
      });
    expect(res.status).toBe(400);
  });
});

// ── GET /api/collector/overview ──────────────────────────────────────────────
describe("GET /api/collector/overview", () => {
  it("groups the latest metrics by service with a status", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          service: "catalog-api",
          category: "quality",
          name: "coverage.lines",
          value: "85.20",
          unit: "%",
          commit_sha: "abc1234",
          recorded_at: "2026-05-01T10:00:00Z",
        },
        {
          service: "catalog-api",
          category: "security",
          name: "trivy.critical",
          value: "2",
          unit: "",
          commit_sha: null,
          recorded_at: "2026-05-01T10:00:00Z",
        },
      ],
    });

    const res = await request(app).get("/api/collector/overview");
    expect(res.status).toBe(200);
    expect(res.body.services).toHaveLength(1);
    const [service] = res.body.services;
    expect(service.service).toBe("catalog-api");
    expect(service.metrics[0]).toMatchObject({
      name: "coverage.lines",
      value: 85.2,
      status: "ok",
      commitSha: "abc1234",
    });
    expect(service.metrics[1]).toMatchObject({
      name: "trivy.critical",
      value: 2,
      status: "critical",
    });
  });

  it("returns an empty list when no metric has been pushed", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/api/collector/overview");
    expect(res.status).toBe(200);
    expect(res.body.services).toEqual([]);
  });
});

// ── GET /api/collector/history ───────────────────────────────────────────────
describe("GET /api/collector/history", () => {
  it("returns the time series of one metric", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { value: "80.1", recorded_at: "2026-04-30T10:00:00Z" },
        { value: "85.2", recorded_at: "2026-05-01T10:00:00Z" },
      ],
    });

    const res = await request(app).get(
      "/api/collector/history?service=catalog-api&name=coverage.lines",
    );
    expect(res.status).toBe(200);
    expect(res.body.points).toEqual([
      { recordedAt: "2026-04-30T10:00:00.000Z", value: 80.1 },
      { recordedAt: "2026-05-01T10:00:00.000Z", value: 85.2 },
    ]);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app).get(
      "/api/collector/history?service=catalog-api",
    );
    expect(res.status).toBe(400);
  });
});
