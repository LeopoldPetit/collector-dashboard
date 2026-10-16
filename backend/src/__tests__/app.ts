/**
 * Crée une instance Express avec tous les routeurs montés,
 * utilisée par les tests d'intégration des routes.
 */
import express, { NextFunction, Request, Response } from "express";
import { technicalRouter } from "../routes/technical";
import { projectRouter } from "../routes/project";
import { devopsRouter } from "../routes/devops";
import { businessRouter } from "../routes/business";
import { dashboardRouter } from "../routes/dashboard";
import { notificationsRouter } from "../routes/notifications";
import { kpisRouter } from "../routes/kpis";
import { collectorRouter } from "../routes/collector";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/api/technical", technicalRouter);
  app.use("/api/project", projectRouter);
  app.use("/api/devops", devopsRouter);
  app.use("/api/business", businessRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/kpis", kpisRouter);
  app.use("/api/collector", collectorRouter);

  app.get("/health", (_req: Request, res: Response) =>
    res.json({ status: "ok" }),
  );

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
