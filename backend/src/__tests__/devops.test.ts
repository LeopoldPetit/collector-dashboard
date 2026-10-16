import request from "supertest";
import { createApp } from "./app";
import { mockQuery } from "../__mocks__/db";

const app = createApp();

beforeEach(() => jest.clearAllMocks());

// ── GET /api/devops/overview ───────────────────────────────────────────────────
describe("GET /api/devops/overview", () => {
  it("returns a formatted devops overview", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          deploy_total: 120,
          deploy_successful: 115,
          deploy_failed: 5,
          change_failure_rate: "4.17",
          frequency_per_day: "4",
          period_days: 30,
          lead_time_avg_days: 1,
          team_developers: 8,
          team_devops: 2,
          team_product_owner: 1,
          team_cto: 1,
        },
      ],
    });

    const res = await request(app).get("/api/devops/overview");
    expect(res.status).toBe(200);
    expect(res.body.deployments.total).toBe(120);
    expect(res.body.deployments.changeFailureRate).toBe(4.17);
    expect(res.body.team.developers).toBe(8);
    expect(res.body.leadTime.averageDays).toBe(1);
  });
});

// ── POST /api/devops/overview ──────────────────────────────────────────────────
describe("POST /api/devops/overview", () => {
  const validBody = {
    deployTotal: 100,
    deploySuccessful: 95,
    deployFailed: 5,
    changeFailureRate: 5,
    frequencyPerDay: 3.3,
    periodDays: 30,
    leadTimeAvgDays: 1.5,
    teamDevelopers: 6,
    teamDevops: 2,
    teamProductOwner: 1,
    teamCto: 1,
  };

  it("creates a devops overview record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 9 }] });

    const res = await request(app).post("/api/devops/overview").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(9);
  });

  it("returns 400 when leadTimeAvgDays is missing", async () => {
    const { leadTimeAvgDays, ...body } = validBody;
    const res = await request(app).post("/api/devops/overview").send(body);
    expect(res.status).toBe(400);
  });
});
