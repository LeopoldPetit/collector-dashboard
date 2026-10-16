/**
 * @module routes/dashboard
 * Express router for the Dashboard domain.
 *
 * Endpoints:
 *   GET  /api/dashboard/overview        — Aggregated KPIs, request volume, weekly deploys, recent activity.
 *   POST /api/dashboard/kpis            — Insert a new KPI card entry.
 *   POST /api/dashboard/request-volume  — Insert a new request-volume data point.
 *   POST /api/dashboard/weekly-deploys  — Insert a new weekly-deploy data point.
 *   POST /api/dashboard/activity        — Create a new activity feed entry.
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireFields } from "../validate";

export const dashboardRouter = Router();

// GET /api/dashboard/overview — aggregates KPIs, charts and activity in a single response.
// All four queries are run in parallel via Promise.all for optimal latency.
dashboardRouter.get("/overview", async (_req: Request, res: Response) => {
  const [kpis, requestVolume, weeklyDeploys, recentActivity] =
    await Promise.all([
      pool.query<{
        title: string;
        value: string;
        unit: string | null;
        status: string;
        trend: string | null;
        description: string | null;
      }>(
        "SELECT title, value, unit, status, trend, description FROM dashboard_kpis ORDER BY id",
      ),
      pool.query<{ time_label: string; requests: number }>(
        "SELECT time_label, requests FROM dashboard_request_volume ORDER BY id",
      ),
      pool.query<{ day_label: string; deploys: number; failures: number }>(
        "SELECT day_label, deploys, failures FROM dashboard_weekly_deploys ORDER BY id",
      ),
      pool.query<{ label: string; time_label: string; severity: string }>(
        "SELECT label, time_label, severity FROM dashboard_recent_activity ORDER BY id",
      ),
    ]);

  res.json({
    kpis: kpis.rows.map((r) => ({
      title: r.title,
      value: Number(r.value),
      unit: r.unit,
      status: r.status,
      trend: r.trend !== null ? Number(r.trend) : undefined,
      description: r.description ?? undefined,
    })),
    requestVolume: requestVolume.rows.map((r) => ({
      time: r.time_label,
      requests: r.requests,
    })),
    weeklyDeploys: weeklyDeploys.rows.map((r) => ({
      day: r.day_label,
      deploys: r.deploys,
      failures: r.failures,
    })),
    recentActivity: recentActivity.rows.map((r) => ({
      label: r.label,
      time: r.time_label,
      severity: r.severity,
    })),
  });
});

// ── POST routes ────────────────────────────────────────────────────────────────

// POST /api/dashboard/kpis — inserts a new KPI card row; optional fields default to null.
dashboardRouter.post("/kpis", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  if (!requireFields(b, ["title", "value", "status"], res)) return;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO dashboard_kpis (title, value, unit, status, trend, description)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [
      b.title,
      b.value,
      b.unit ?? null,
      b.status,
      b.trend ?? null,
      b.description ?? null,
    ],
  );
  res.status(201).json({ id: rows[0].id });
});

// POST /api/dashboard/request-volume — adds a single request-volume sample point.
dashboardRouter.post("/request-volume", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  if (!requireFields(b, ["time", "requests"], res)) return;

  const { rows } = await pool.query<{ id: number }>(
    "INSERT INTO dashboard_request_volume (time_label, requests) VALUES ($1,$2) RETURNING id",
    [b.time, b.requests],
  );
  res.status(201).json({ id: rows[0].id });
});

// POST /api/dashboard/weekly-deploys — adds a single day-level deploy/failure record.
dashboardRouter.post("/weekly-deploys", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  if (!requireFields(b, ["day", "deploys", "failures"], res)) return;

  const { rows } = await pool.query<{ id: number }>(
    "INSERT INTO dashboard_weekly_deploys (day_label, deploys, failures) VALUES ($1,$2,$3) RETURNING id",
    [b.day, b.deploys, b.failures],
  );
  res.status(201).json({ id: rows[0].id });
});

// POST /api/dashboard/activity — appends a new entry to the recent-activity feed.
dashboardRouter.post("/activity", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  if (!requireFields(b, ["label", "time", "severity"], res)) return;

  const { rows } = await pool.query<{ id: number }>(
    "INSERT INTO dashboard_recent_activity (label, time_label, severity) VALUES ($1,$2,$3) RETURNING id",
    [b.label, b.time, b.severity],
  );
  res.status(201).json({ id: rows[0].id });
});
