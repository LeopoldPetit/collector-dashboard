/**
 * @module index
 * Express application entry point for the StreamFlow API.
 *
 * Mounts all domain routers under `/api/*`, exposes a `/health` liveness probe,
 * and registers a global error handler as a safety net for unhandled exceptions.
 */
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import { technicalRouter } from "./routes/technical";
import { projectRouter } from "./routes/project";
import { devopsRouter } from "./routes/devops";
import { businessRouter } from "./routes/business";
import { dashboardRouter } from "./routes/dashboard";
import { notificationsRouter } from "./routes/notifications";
import { kpisRouter } from "./routes/kpis";
import { collectorRouter } from "./routes/collector";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// ── Domain routers ─────────────────────────────────────────────────────────────
app.use("/api/technical", technicalRouter);
app.use("/api/project", projectRouter);
app.use("/api/devops", devopsRouter);
app.use("/api/business", businessRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/kpis", kpisRouter);
app.use("/api/collector", collectorRouter);

/** Liveness probe used by `start.sh` and container orchestrators. */
app.get("/health", (_req: Request, res: Response) =>
  res.json({ status: "ok" }),
);

// Global error handler — catches any error thrown inside async route handlers.
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  console.error(err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.info(`StreamFlow API listening on http://localhost:${PORT}`);
});
