/**
 * @module routes/business
 * Express router for the Business domain.
 *
 * Endpoints:
 *   GET  /api/business/overview — Revenue, ARPU, conversions, and churn KPIs.
 *   GET  /api/business/users    — User stats (totals, actives, new/churned) + monthly evolution.
 *   POST /api/business/overview — Insert a new business overview snapshot.
 *   POST /api/business/users    — Persist updated user statistics.
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireFields } from "../validate";

export const businessRouter = Router();

// GET /api/business/overview — returns the most recent business KPI snapshot.
businessRouter.get("/overview", async (_req: Request, res: Response) => {
  const { rows } = await pool.query<{
    revenue_total: string;
    revenue_currency: string;
    revenue_period: string;
    arpu_value: string;
    arpu_currency: string;
    subscription_price: string;
    conv_visitors: number;
    conv_new_subs: number;
    conv_rate: string;
    churn_users: number;
    churn_rate: string;
    retention_rate: string;
  }>("SELECT * FROM business_overview ORDER BY recorded_at DESC LIMIT 1");
  const r = rows[0];
  res.json({
    revenue: {
      total: Number(r.revenue_total),
      currency: r.revenue_currency,
      period: r.revenue_period,
    },
    arpu: { value: Number(r.arpu_value), currency: r.arpu_currency },
    subscriptionPrice: Number(r.subscription_price),
    conversions: {
      visitors: r.conv_visitors,
      newSubscriptions: r.conv_new_subs,
      conversionRate: Number(r.conv_rate),
    },
    churn: {
      churnedUsers: r.churn_users,
      churnRate: Number(r.churn_rate),
      retentionRate: Number(r.retention_rate),
    },
  });
});

// GET /api/business/users — returns current user stats joined with monthly evolution data.
businessRouter.get("/users", async (_req: Request, res: Response) => {
  const [users, evolution] = await Promise.all([
    pool.query<{
      total: number;
      active_monthly: number;
      start_of_month: number;
      end_of_month: number;
      new_this_month: number;
      churned_this_month: number;
    }>(
      "SELECT total, active_monthly, start_of_month, end_of_month, new_this_month, churned_this_month FROM business_users ORDER BY recorded_at DESC LIMIT 1",
    ),
    pool.query<{ label: string; value: number }>(
      "SELECT label, value FROM business_user_evolution ORDER BY id",
    ),
  ]);
  const u = users.rows[0];
  res.json({
    users: {
      total: u.total,
      activeMonthly: u.active_monthly,
      startOfMonth: u.start_of_month,
      endOfMonth: u.end_of_month,
      newThisMonth: u.new_this_month,
      churnedThisMonth: u.churned_this_month,
    },
    evolution: evolution.rows.map((r) => ({ label: r.label, value: r.value })),
  });
});

// ── POST routes ────────────────────────────────────────────────────────────────

// POST /api/business/overview — inserts a new business overview snapshot row.
businessRouter.post("/overview", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  const required = [
    "revenueTotal",
    "revenueCurrency",
    "revenuePeriod",
    "arpuValue",
    "arpuCurrency",
    "subscriptionPrice",
    "convVisitors",
    "convNewSubs",
    "convRate",
    "churnUsers",
    "churnRate",
    "retentionRate",
  ];
  if (!requireFields(b, required, res)) return;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO business_overview
       (revenue_total, revenue_currency, revenue_period,
        arpu_value, arpu_currency, subscription_price,
        conv_visitors, conv_new_subs, conv_rate,
        churn_users, churn_rate, retention_rate)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [
      b.revenueTotal,
      b.revenueCurrency,
      b.revenuePeriod,
      b.arpuValue,
      b.arpuCurrency,
      b.subscriptionPrice,
      b.convVisitors,
      b.convNewSubs,
      b.convRate,
      b.churnUsers,
      b.churnRate,
      b.retentionRate,
    ],
  );
  res.status(201).json({ id: rows[0].id });
});

// POST /api/business/users — persists an updated user-stats snapshot (called after inline edit in the UI).
businessRouter.post("/users", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  const required = [
    "total",
    "activeMonthly",
    "startOfMonth",
    "endOfMonth",
    "newThisMonth",
    "churnedThisMonth",
  ];
  if (!requireFields(b, required, res)) return;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO business_users
       (total, active_monthly, start_of_month, end_of_month, new_this_month, churned_this_month)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [
      b.total,
      b.activeMonthly,
      b.startOfMonth,
      b.endOfMonth,
      b.newThisMonth,
      b.churnedThisMonth,
    ],
  );
  res.status(201).json({ id: rows[0].id });
});
