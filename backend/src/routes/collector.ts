/**
 * @module routes/collector
 * Express router for the Collector domain: metrics pushed by CI pipelines.
 *
 * Endpoints:
 *   POST /api/collector/metrics  — Ingest metric points (header X-Ingest-Token required).
 *   GET  /api/collector/overview — Latest value of every metric, grouped by service.
 *   GET  /api/collector/history  — Time series for one service and one metric.
 */
import { timingSafeEqual } from "crypto";
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireFields } from "../validate";

export const collectorRouter = Router();

const CATEGORIES = ["quality", "security", "tests", "performance"] as const;
type Category = (typeof CATEGORIES)[number];

const MAX_METRICS_PER_PUSH = 500;
const DEFAULT_HISTORY_LIMIT = 50;
const MAX_HISTORY_LIMIT = 200;

export type CollectorStatus = "ok" | "warning" | "critical" | "info";

interface IIncomingMetric {
  category: Category;
  name: string;
  value: number;
  unit?: string;
}

interface IStatusRule {
  match: RegExp;
  evaluate: (value: number) => CollectorStatus;
}

/**
 * Default status rules per metric name. Metrics without a rule are `info`.
 * Thresholds are defaults and can be tuned here.
 */
const STATUS_RULES: IStatusRule[] = [
  {
    match: /^coverage\./,
    evaluate: (v) => (v >= 80 ? "ok" : v >= 60 ? "warning" : "critical"),
  },
  {
    match: /^sonar\.quality_gate$/,
    evaluate: (v) => (v === 1 ? "ok" : "critical"),
  },
  {
    match:
      /^(sonar\.(bugs|vulnerabilities)|npm_audit\.critical|trivy\.critical|tests\.failed)$/,
    evaluate: (v) => (v === 0 ? "ok" : "critical"),
  },
  {
    match: /^(npm_audit\.high|trivy\.high)$/,
    evaluate: (v) => (v === 0 ? "ok" : "warning"),
  },
  {
    match: /^k6\.p95_ms$/,
    evaluate: (v) => (v <= 500 ? "ok" : v <= 1000 ? "warning" : "critical"),
  },
  {
    match: /^k6\.error_rate$/,
    evaluate: (v) => (v < 1 ? "ok" : v < 5 ? "warning" : "critical"),
  },
];

/** Returns the status of a metric value according to {@link STATUS_RULES}. */
export function statusFor(name: string, value: number): CollectorStatus {
  const rule = STATUS_RULES.find((r) => r.match.test(name));
  return rule ? rule.evaluate(value) : "info";
}

function isValidMetric(m: unknown): m is IIncomingMetric {
  if (typeof m !== "object" || m === null) return false;
  const metric = m as Record<string, unknown>;
  return (
    typeof metric.name === "string" &&
    metric.name.trim().length > 0 &&
    typeof metric.value === "number" &&
    Number.isFinite(metric.value) &&
    CATEGORIES.includes(metric.category as Category) &&
    (metric.unit === undefined || typeof metric.unit === "string")
  );
}

function tokenMatches(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ── POST routes ──────────────────────────────────────────────────────────────

// POST /api/collector/metrics — inserts a batch of metric points pushed by CI.
collectorRouter.post("/metrics", async (req: Request, res: Response) => {
  const expectedToken = process.env.INGEST_TOKEN;
  if (!expectedToken) {
    res.status(503).json({ error: "INGEST_TOKEN non configuré" });
    return;
  }
  if (!tokenMatches(req.header("X-Ingest-Token"), expectedToken)) {
    res.status(401).json({ error: "Token d'ingestion invalide" });
    return;
  }

  const b = (req.body ?? {}) as Record<string, unknown>;
  if (!requireFields(b, ["service", "metrics"], res)) return;

  if (typeof b.service !== "string" || b.service.trim().length === 0) {
    res.status(400).json({ error: "service doit être une chaîne non vide" });
    return;
  }
  const metrics = b.metrics;
  if (
    !Array.isArray(metrics) ||
    metrics.length === 0 ||
    metrics.length > MAX_METRICS_PER_PUSH
  ) {
    res.status(400).json({
      error: `metrics doit être un tableau de 1 à ${MAX_METRICS_PER_PUSH} éléments`,
    });
    return;
  }
  if (!metrics.every(isValidMetric)) {
    res.status(400).json({
      error:
        "Chaque métrique requiert name (texte), value (nombre fini), category (quality, security, tests, performance) et unit optionnel (texte)",
    });
    return;
  }

  const commitSha = typeof b.commitSha === "string" ? b.commitSha : null;
  const pipelineRun = typeof b.pipelineRun === "string" ? b.pipelineRun : null;

  const values: unknown[] = [];
  const placeholders = metrics.map((m, i) => {
    const o = i * 7;
    values.push(
      b.service,
      m.category,
      m.name,
      m.value,
      m.unit ?? "",
      commitSha,
      pipelineRun,
    );
    return `($${o + 1},$${o + 2},$${o + 3},$${o + 4},$${o + 5},$${o + 6},$${
      o + 7
    })`;
  });

  await pool.query(
    `INSERT INTO collector_metric_points
       (service, category, name, value, unit, commit_sha, pipeline_run)
     VALUES ${placeholders.join(",")}`,
    values,
  );
  res.status(201).json({ inserted: metrics.length });
});

// ── GET routes ───────────────────────────────────────────────────────────────

interface IOverviewRow {
  service: string;
  category: Category;
  name: string;
  value: string | number;
  unit: string;
  commit_sha: string | null;
  recorded_at: Date | string;
}

// GET /api/collector/overview — latest value of each metric, grouped by service.
collectorRouter.get("/overview", async (_req: Request, res: Response) => {
  const { rows } = await pool.query<IOverviewRow>(
    `SELECT DISTINCT ON (service, name)
            service, category, name, value, unit, commit_sha, recorded_at
       FROM collector_metric_points
      ORDER BY service, name, recorded_at DESC`,
  );

  const byService = new Map<
    string,
    Array<{
      category: Category;
      name: string;
      value: number;
      unit: string;
      status: CollectorStatus;
      recordedAt: string;
      commitSha: string | null;
    }>
  >();

  for (const r of rows) {
    const value = Number(r.value);
    const metric = {
      category: r.category,
      name: r.name,
      value,
      unit: r.unit,
      status: statusFor(r.name, value),
      recordedAt: new Date(r.recorded_at).toISOString(),
      commitSha: r.commit_sha,
    };
    const list = byService.get(r.service) ?? [];
    list.push(metric);
    byService.set(r.service, list);
  }

  res.json({
    generatedAt: new Date().toISOString(),
    services: [...byService.entries()].map(([service, metrics]) => ({
      service,
      metrics,
    })),
  });
});

// GET /api/collector/history?service=&name=&limit= — time series of one metric.
collectorRouter.get("/history", async (req: Request, res: Response) => {
  const q = req.query as Record<string, unknown>;
  if (!requireFields(q, ["service", "name"], res)) return;

  const limitParam = Number.parseInt(String(q.limit ?? ""), 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_HISTORY_LIMIT)
    : DEFAULT_HISTORY_LIMIT;

  const { rows } = await pool.query<{
    value: string | number;
    recorded_at: Date | string;
  }>(
    `SELECT value, recorded_at FROM (
       SELECT value, recorded_at
         FROM collector_metric_points
        WHERE service = $1 AND name = $2
        ORDER BY recorded_at DESC
        LIMIT $3
     ) recent
     ORDER BY recorded_at ASC`,
    [String(q.service), String(q.name), limit],
  );

  res.json({
    service: String(q.service),
    name: String(q.name),
    points: rows.map((r) => ({
      recordedAt: new Date(r.recorded_at).toISOString(),
      value: Number(r.value),
    })),
  });
});
