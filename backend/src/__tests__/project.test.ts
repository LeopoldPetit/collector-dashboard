import request from "supertest";
import { createApp } from "./app";
import { mockQuery } from "../__mocks__/db";

const app = createApp();

beforeEach(() => jest.clearAllMocks());

// ── GET /api/project/overview ──────────────────────────────────────────────────
describe("GET /api/project/overview", () => {
  it("returns a formatted project overview", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          bugs_detected: 42,
          bugs_fixed: 38,
          bugs_open: 4,
          fix_rate: "90.48",
          features_delivered: 12,
          bug_rate: "3.5",
          period: "Q1 2026",
        },
      ],
    });

    const res = await request(app).get("/api/project/overview");
    expect(res.status).toBe(200);
    expect(res.body.bugs.detected).toBe(42);
    expect(res.body.bugs.fixRate).toBe(90.48);
    expect(res.body.features.delivered).toBe(12);
    expect(res.body.period).toBe("Q1 2026");
  });
});

// ── GET /api/project/sprints ───────────────────────────────────────────────────
describe("GET /api/project/sprints", () => {
  it("returns sprints with summary", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            sprint_id: 1,
            name: "Sprint 1",
            short_name: "S1",
            story_points_planned: 40,
            story_points_done: 36,
            velocity_percent: "90",
            status: "done",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            total_planned: 40,
            total_done: 36,
            average_velocity_percent: "90",
            trend: "up",
          },
        ],
      });

    const res = await request(app).get("/api/project/sprints");
    expect(res.status).toBe(200);
    expect(res.body.sprints[0].velocityPercent).toBe(90);
    expect(res.body.summary.trend).toBe("up");
  });
});

// ── POST /api/project/overview ─────────────────────────────────────────────────
describe("POST /api/project/overview", () => {
  const validBody = {
    bugsDetected: 10,
    bugsFixed: 8,
    bugsOpen: 2,
    fixRate: 80,
    featuresDelivered: 5,
    bugRate: 4,
    period: "Q2 2026",
  };

  it("creates a project overview record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 5 }] });

    const res = await request(app)
      .post("/api/project/overview")
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(5);
  });

  it("returns 400 when period is missing", async () => {
    const { period, ...body } = validBody;
    const res = await request(app).post("/api/project/overview").send(body);
    expect(res.status).toBe(400);
  });
});

// ── POST /api/project/sprints ──────────────────────────────────────────────────
describe("POST /api/project/sprints", () => {
  it("creates a sprint record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 3 }] });

    const res = await request(app).post("/api/project/sprints").send({
      sprintId: 3,
      name: "Sprint 3",
      shortName: "S3",
      storyPointsPlanned: 50,
      storyPointsDone: 45,
      velocityPercent: 90,
      status: "done",
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(3);
  });

  it("returns 400 when storyPointsPlanned is missing", async () => {
    const res = await request(app).post("/api/project/sprints").send({
      sprintId: 1,
      name: "S",
      shortName: "S",
      storyPointsDone: 0,
      velocityPercent: 0,
      status: "open",
    });
    expect(res.status).toBe(400);
  });
});
