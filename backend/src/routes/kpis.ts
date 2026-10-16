/**
 * @module routes/kpis
 * Express router for the cross-domain KPI summary.
 *
 * Endpoints:
 *   GET  /api/kpis/summary — Aggregated KPI snapshot across all domains, grouped by domain key.
 *   POST /api/kpis/summary — Insert a new KPI summary with its associated metric rows.
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireFields } from "../validate";

export const kpisRouter = Router();

// GET /api/kpis/summary — returns the latest summary row and joins its metrics,
// reshaping them into a nested domain → metricKey object for easy frontend consumption.
kpisRouter.get("/summary", async (_req: Request, res: Response) => {
  const [summaryRes, metricsRes] = await Promise.all([
    pool.query<{
      id: number;
      generated_at: string;
      period: string;
      company: string;
      global_status: string;
    }>(
      "SELECT id, generated_at, period, company, global_status FROM kpi_summary ORDER BY generated_at DESC LIMIT 1",
    ),
    pool.query<{
      domain: string;
      metric_key: string;
      value: string;
      unit: string;
      status: string;
      threshold: string | null;
      summary_id: number;
    }>(
      "SELECT summary_id, domain, metric_key, value, unit, status, threshold FROM kpi_metrics ORDER BY id",
    ),
  ]);

  const s = summaryRes.rows[0];
  const metricsByDomain: Record<string, Record<string, unknown>> = {};

  // Filter metrics to the current summary id before grouping.
  for (const m of metricsRes.rows.filter((r) => r.summary_id === s.id)) {
    if (!metricsByDomain[m.domain]) metricsByDomain[m.domain] = {};
    metricsByDomain[m.domain][m.metric_key] = {
      value: Number(m.value),
      unit: m.unit,
      status: m.status,
      ...(m.threshold !== null ? { threshold: Number(m.threshold) } : {}),
    };
  }

  res.json({
    generatedAt: s.generated_at,
    period: s.period,
    company: s.company,
    globalStatus: s.global_status,
    ...metricsByDomain,
  });
});

// POST /api/kpis/summary — inserts a summary row then bulk-inserts its metric rows sequentially.
// Body: { generatedAt, period, company, globalStatus, metrics: [{ domain, metricKey, value, unit, status, threshold? }] }
kpisRouter.post("/summary", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  if (
    !requireFields(
      b,
      ["generatedAt", "period", "company", "globalStatus", "metrics"],
      res,
    )
  )
    return;

  const metrics = b.metrics as Array<{
    domain: string;
    metricKey: string;
    value: number;
    unit: string;
    status: string;
    threshold?: number;
  }>;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO kpi_summary (generated_at, period, company, global_status)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [b.generatedAt, b.period, b.company, b.globalStatus],
  );
  const summaryId = rows[0].id;

  // Insert each metric row individually, linking it to the parent summary via summaryId.
  for (const m of metrics) {
    await pool.query(
      `INSERT INTO kpi_metrics (summary_id, domain, metric_key, value, unit, status, threshold)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        summaryId,
        m.domain,
        m.metricKey,
        m.value,
        m.unit,
        m.status,
        m.threshold ?? null,
      ],
    );
  }

  res.status(201).json({ id: summaryId, metricsInserted: metrics.length });
});
