/**
 * @module routes/devops
 * Express router for the DevOps domain.
 *
 * Endpoints:
 *   GET  /api/devops/overview — Latest deployment stats, lead time, and team composition.
 *   POST /api/devops/overview — Insert a new DevOps overview snapshot (used when updating team headcount).
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireFields } from "../validate";

export const devopsRouter = Router();

// GET /api/devops/overview — returns the most recent DevOps overview snapshot.
devopsRouter.get("/overview", async (_req: Request, res: Response) => {
  const { rows } = await pool.query<{
    deploy_total: number;
    deploy_successful: number;
    deploy_failed: number;
    change_failure_rate: string;
    frequency_per_day: string;
    period_days: number;
    lead_time_avg_days: number;
    team_developers: number;
    team_devops: number;
    team_product_owner: number;
    team_cto: number;
  }>("SELECT * FROM devops_overview ORDER BY recorded_at DESC LIMIT 1");
  const r = rows[0];
  res.json({
    deployments: {
      total: r.deploy_total,
      successful: r.deploy_successful,
      failed: r.deploy_failed,
      changeFailureRate: Number(r.change_failure_rate),
      frequencyPerDay: Number(r.frequency_per_day),
      periodDays: r.period_days,
    },
    leadTime: { averageDays: r.lead_time_avg_days, unit: "days" },
    team: {
      developers: r.team_developers,
      devops: r.team_devops,
      productOwner: r.team_product_owner,
      cto: r.team_cto,
    },
  });
});

// ── POST routes ────────────────────────────────────────────────────────────────

// POST /api/devops/overview — inserts a full DevOps snapshot row (flat payload mapped to normalised columns).
devopsRouter.post("/overview", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  const required = [
    "deployTotal",
    "deploySuccessful",
    "deployFailed",
    "changeFailureRate",
    "frequencyPerDay",
    "periodDays",
    "leadTimeAvgDays",
    "teamDevelopers",
    "teamDevops",
    "teamProductOwner",
    "teamCto",
  ];
  if (!requireFields(b, required, res)) return;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO devops_overview
       (deploy_total, deploy_successful, deploy_failed,
        change_failure_rate, frequency_per_day, period_days,
        lead_time_avg_days,
        team_developers, team_devops, team_product_owner, team_cto)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [
      b.deployTotal,
      b.deploySuccessful,
      b.deployFailed,
      b.changeFailureRate,
      b.frequencyPerDay,
      b.periodDays,
      b.leadTimeAvgDays,
      b.teamDevelopers,
      b.teamDevops,
      b.teamProductOwner,
      b.teamCto,
    ],
  );
  res.status(201).json({ id: rows[0].id });
});
