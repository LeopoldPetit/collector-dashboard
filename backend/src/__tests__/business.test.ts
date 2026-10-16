import request from "supertest";
import { createApp } from "./app";
import { mockQuery } from "../__mocks__/db";

const app = createApp();

beforeEach(() => jest.clearAllMocks());

// ── GET /api/business/overview ─────────────────────────────────────────────────
describe("GET /api/business/overview", () => {
  it("returns a formatted business overview", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          revenue_total: "48500",
          revenue_currency: "EUR",
          revenue_period: "monthly",
          arpu_value: "9.99",
          arpu_currency: "EUR",
          subscription_price: "9.99",
          conv_visitors: 3200,
          conv_new_subs: 148,
          conv_rate: "4.63",
          churn_users: 42,
          churn_rate: "0.87",
          retention_rate: "99.13",
        },
      ],
    });

    const res = await request(app).get("/api/business/overview");
    expect(res.status).toBe(200);
    expect(res.body.revenue.total).toBe(48500);
    expect(res.body.arpu.value).toBe(9.99);
    expect(res.body.conversions.conversionRate).toBe(4.63);
    expect(res.body.churn.retentionRate).toBe(99.13);
  });
});

// ── GET /api/business/users ────────────────────────────────────────────────────
describe("GET /api/business/users", () => {
  it("returns users and evolution data", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            total: 4800,
            active_monthly: 3900,
            start_of_month: 4700,
            end_of_month: 4800,
            new_this_month: 148,
            churned_this_month: 42,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { label: "Jan", value: 4200 },
          { label: "Feb", value: 4500 },
        ],
      });

    const res = await request(app).get("/api/business/users");
    expect(res.status).toBe(200);
    expect(res.body.users.total).toBe(4800);
    expect(res.body.evolution).toHaveLength(2);
    expect(res.body.evolution[0].label).toBe("Jan");
  });
});

// ── POST /api/business/overview ────────────────────────────────────────────────
describe("POST /api/business/overview", () => {
  const validBody = {
    revenueTotal: 48000,
    revenueCurrency: "EUR",
    revenuePeriod: "monthly",
    arpuValue: 9.99,
    arpuCurrency: "EUR",
    subscriptionPrice: 9.99,
    convVisitors: 3000,
    convNewSubs: 130,
    convRate: 4.33,
    churnUsers: 40,
    churnRate: 0.83,
    retentionRate: 99.17,
  };

  it("creates a business overview record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 2 }] });

    const res = await request(app)
      .post("/api/business/overview")
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(2);
  });

  it("returns 400 when churnRate is missing", async () => {
    const { churnRate, ...body } = validBody;
    const res = await request(app).post("/api/business/overview").send(body);
    expect(res.status).toBe(400);
  });
});

// ── POST /api/business/users ───────────────────────────────────────────────────
describe("POST /api/business/users", () => {
  it("creates a business users record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 6 }] });

    const res = await request(app).post("/api/business/users").send({
      total: 5000,
      activeMonthly: 4000,
      startOfMonth: 4900,
      endOfMonth: 5000,
      newThisMonth: 150,
      churnedThisMonth: 50,
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(6);
  });

  it("returns 400 when activeMonthly is missing", async () => {
    const res = await request(app).post("/api/business/users").send({
      total: 5000,
      startOfMonth: 4900,
      endOfMonth: 5000,
      newThisMonth: 150,
      churnedThisMonth: 50,
    });
    expect(res.status).toBe(400);
  });
});
