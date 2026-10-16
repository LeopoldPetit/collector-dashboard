/**
 * @module routes/project
 * Express router for the Project domain.
 *
 * Endpoints:
 *   GET  /api/project/overview  — Latest project KPI snapshot (bugs, features, fix rate).
 *   GET  /api/project/sprints   — Sprint list + velocity summary.
 *   POST /api/project/overview  — Insert a new project overview snapshot.
 *   POST /api/project/sprints   — Create a new sprint record.
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireFields } from "../validate";

export const projectRouter = Router();

// GET /api/project/overview — returns the most recent project KPI snapshot.
projectRouter.get("/overview", async (_req: Request, res: Response) => {
  const { rows } = await pool.query<{
    bugs_detected: number;
    bugs_fixed: number;
    bugs_open: number;
    fix_rate: string;
    features_delivered: number;
    bug_rate: string;
    period: string;
  }>(
    "SELECT bugs_detected, bugs_fixed, bugs_open, fix_rate, features_delivered, bug_rate, period FROM project_overview ORDER BY recorded_at DESC LIMIT 1",
  );
  const r = rows[0];
  res.json({
    bugs: {
      detected: r.bugs_detected,
      fixed: r.bugs_fixed,
      open: r.bugs_open,
      fixRate: Number(r.fix_rate),
    },
    features: { delivered: r.features_delivered, bugRate: Number(r.bug_rate) },
    period: r.period,
  });
});

// GET /api/project/sprints — returns all sprints and an aggregate velocity summary.
projectRouter.get("/sprints", async (_req: Request, res: Response) => {
  const [sprints, summary] = await Promise.all([
    pool.query<{
      sprint_id: number;
      name: string;
      short_name: string;
      story_points_planned: number;
      story_points_done: number;
      velocity_percent: string;
      status: string;
    }>(
      "SELECT sprint_id, name, short_name, story_points_planned, story_points_done, velocity_percent, status FROM project_sprints ORDER BY sprint_id",
    ),
    pool.query<{
      total_planned: number;
      total_done: number;
      average_velocity_percent: string;
      trend: string;
    }>(
      "SELECT total_planned, total_done, average_velocity_percent, trend FROM project_sprints_summary ORDER BY recorded_at DESC LIMIT 1",
    ),
  ]);
  const s = summary.rows[0];
  res.json({
    sprints: sprints.rows.map((r) => ({
      id: r.sprint_id,
      name: r.name,
      shortName: r.short_name,
      storyPointsPlanned: r.story_points_planned,
      storyPointsDone: r.story_points_done,
      velocityPercent: Number(r.velocity_percent),
      status: r.status,
    })),
    summary: {
      totalPlanned: s.total_planned,
      totalDone: s.total_done,
      averageVelocityPercent: Number(s.average_velocity_percent),
      trend: s.trend,
    },
  });
});

// ── POST routes ────────────────────────────────────────────────────────────────

// POST /api/project/overview — inserts a new project KPI snapshot row.
projectRouter.post("/overview", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  const required = [
    "bugsDetected",
    "bugsFixed",
    "bugsOpen",
    "fixRate",
    "featuresDelivered",
    "bugRate",
    "period",
  ];
  if (!requireFields(b, required, res)) return;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO project_overview
       (bugs_detected, bugs_fixed, bugs_open, fix_rate, features_delivered, bug_rate, period)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [
      b.bugsDetected,
      b.bugsFixed,
      b.bugsOpen,
      b.fixRate,
      b.featuresDelivered,
      b.bugRate,
      b.period,
    ],
  );
  res.status(201).json({ id: rows[0].id });
});

// POST /api/project/sprints — creates a new sprint record.
// `sprintId` is sent by the client (Date.now()); the DB also assigns its own `id` PK.
projectRouter.post("/sprints", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  const required = [
    "sprintId",
    "name",
    "shortName",
    "storyPointsPlanned",
    "storyPointsDone",
    "velocityPercent",
    "status",
  ];
  if (!requireFields(b, required, res)) return;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO project_sprints
       (sprint_id, name, short_name, story_points_planned, story_points_done, velocity_percent, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [
      b.sprintId,
      b.name,
      b.shortName,
      b.storyPointsPlanned,
      b.storyPointsDone,
      b.velocityPercent,
      b.status,
    ],
  );
  res.status(201).json({ id: rows[0].id });
});
