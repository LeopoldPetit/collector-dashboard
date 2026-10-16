/**
 * @module routes/technical
 * Express router for the Technical domain.
 *
 * Endpoints:
 *   GET  /api/technical/overview        — Latest system health KPIs snapshot.
 *   GET  /api/technical/incidents       — Incident list + summary statistics.
 *   GET  /api/technical/response-times  — Response-time samples + percentile stats.
 *   POST /api/technical/overview        — Insert a new technical overview snapshot.
 *   POST /api/technical/incidents       — Create a new incident record.
 *   POST /api/technical/response-times  — Bulk-insert new response-time samples.
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireFields } from "../validate";

export const technicalRouter = Router();

// GET /api/technical/overview — returns the most recent technical KPI snapshot.
technicalRouter.get("/overview", async (_req: Request, res: Response) => {
  const { rows } = await pool.query<{
    total_requests: string;
    error_requests: string;
    error_rate: string;
    uptime_total_hours: string;
    uptime_downtime_h: string;
    uptime_percent: string;
    mttr_avg_hours: string;
    rt_average_ms: number;
    rt_p95_ms: number;
  }>(`SELECT total_requests, error_requests, error_rate,
         uptime_total_hours, uptime_downtime_h, uptime_percent,
         mttr_avg_hours, rt_average_ms, rt_p95_ms
      FROM technical_overview ORDER BY recorded_at DESC LIMIT 1`);
  const r = rows[0];
  res.json({
    totalRequests: Number(r.total_requests),
    errorRequests: Number(r.error_requests),
    errorRate: Number(r.error_rate),
    uptime: {
      totalHours: Number(r.uptime_total_hours),
      downtimeHours: Number(r.uptime_downtime_h),
      uptimePercent: Number(r.uptime_percent),
    },
    mttr: { averageHours: Number(r.mttr_avg_hours), unit: "hours" },
    responseTimes: { average: r.rt_average_ms, p95: r.rt_p95_ms, unit: "ms" },
  });
});

// GET /api/technical/incidents — returns incident list and aggregate summary.
technicalRouter.get("/incidents", async (_req: Request, res: Response) => {
  const [incidents, summary] = await Promise.all([
    pool.query<{
      id: number;
      title: string;
      duration_hours: string;
      duration_minutes: number;
      severity: string;
      status: string;
    }>(
      "SELECT id, title, duration_hours, duration_minutes, severity, status FROM technical_incidents ORDER BY id",
    ),
    pool.query<{
      total: number;
      total_downtime_hours: string;
      mttr_hours: string;
      period_days: number;
    }>(
      "SELECT total, total_downtime_hours, mttr_hours, period_days FROM technical_incidents_summary ORDER BY recorded_at DESC LIMIT 1",
    ),
  ]);
  const s = summary.rows[0];
  res.json({
    incidents: incidents.rows.map((r) => ({
      id: r.id,
      title: r.title,
      durationHours: Number(r.duration_hours),
      durationMinutes: r.duration_minutes,
      severity: r.severity,
      status: r.status,
    })),
    summary: {
      total: s.total,
      totalDowntimeHours: Number(s.total_downtime_hours),
      mttrHours: Number(s.mttr_hours),
      periodDays: s.period_days,
    },
  });
});

// GET /api/technical/response-times — returns time-series samples and percentile stats.
technicalRouter.get("/response-times", async (_req: Request, res: Response) => {
  const [samples, stats] = await Promise.all([
    pool.query<{ sample_index: number; ms: number }>(
      "SELECT sample_index, ms FROM technical_response_time_samples ORDER BY sample_index",
    ),
    pool.query<{
      min_ms: number;
      max_ms: number;
      average_ms: number;
      p50_ms: number;
      p90_ms: number;
      p95_ms: number;
    }>(
      "SELECT min_ms, max_ms, average_ms, p50_ms, p90_ms, p95_ms FROM technical_response_time_stats ORDER BY recorded_at DESC LIMIT 1",
    ),
  ]);
  const s = stats.rows[0];
  res.json({
    samples: samples.rows.map((r) => ({ index: r.sample_index, ms: r.ms })),
    stats: {
      min: s.min_ms,
      max: s.max_ms,
      average: s.average_ms,
      p50: s.p50_ms,
      p90: s.p90_ms,
      p95: s.p95_ms,
      unit: "ms",
    },
  });
});

// ── POST routes ────────────────────────────────────────────────────────────────

// POST /api/technical/overview — inserts a new technical KPI snapshot row.
technicalRouter.post("/overview", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  const required = [
    "totalRequests",
    "errorRequests",
    "errorRate",
    "uptimeTotalHours",
    "uptimeDowntimeHours",
    "uptimePercent",
    "mttrAvgHours",
    "rtAverageMs",
    "rtP95Ms",
  ];
  if (!requireFields(b, required, res)) return;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO technical_overview
       (total_requests, error_requests, error_rate,
        uptime_total_hours, uptime_downtime_h, uptime_percent,
        mttr_avg_hours, rt_average_ms, rt_p95_ms)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [
      b.totalRequests,
      b.errorRequests,
      b.errorRate,
      b.uptimeTotalHours,
      b.uptimeDowntimeHours,
      b.uptimePercent,
      b.mttrAvgHours,
      b.rtAverageMs,
      b.rtP95Ms,
    ],
  );
  res.status(201).json({ id: rows[0].id });
});

// POST /api/technical/incidents — creates a new incident record.
technicalRouter.post("/incidents", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  const required = [
    "title",
    "durationHours",
    "durationMinutes",
    "severity",
    "status",
  ];
  if (!requireFields(b, required, res)) return;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO technical_incidents (title, duration_hours, duration_minutes, severity, status)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [b.title, b.durationHours, b.durationMinutes, b.severity, b.status],
  );
  res.status(201).json({ id: rows[0].id });
});

// POST /api/technical/response-times — bulk-inserts new samples and a stats row.
technicalRouter.post("/response-times", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  if (!requireFields(b, ["samples", "stats"], res)) return;

  const samples = b.samples as Array<{ index: number; ms: number }>;
  const stats = b.stats as {
    min: number;
    max: number;
    average: number;
    p50: number;
    p90: number;
    p95: number;
  };

  await pool.query(
    `INSERT INTO technical_response_time_stats (min_ms, max_ms, average_ms, p50_ms, p90_ms, p95_ms)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [stats.min, stats.max, stats.average, stats.p50, stats.p90, stats.p95],
  );

  // Insert each sample individually; a bulk VALUES approach would be more
  // efficient at scale but kept simple here for readability.
  for (const s of samples) {
    await pool.query(
      "INSERT INTO technical_response_time_samples (sample_index, ms) VALUES ($1,$2)",
      [s.index, s.ms],
    );
  }
  res.status(201).json({ inserted: samples.length });
});
