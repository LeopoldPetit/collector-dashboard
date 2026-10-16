/**
 * @module routes/notifications
 * Express router for the Notifications domain.
 *
 * Endpoints:
 *   GET  /api/notifications — Returns all notifications and the count of unread ones.
 *   POST /api/notifications — Creates a new notification entry.
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireFields } from "../validate";

export const notificationsRouter = Router();

// GET /api/notifications — fetches all notifications; unreadCount is computed in-memory from is_read.
notificationsRouter.get("/", async (_req: Request, res: Response) => {
  const { rows } = await pool.query<{
    id: number;
    text: string;
    time_label: string;
    severity: string;
    is_read: boolean;
  }>(
    "SELECT id, text, time_label, severity, is_read FROM notifications ORDER BY id",
  );

  res.json({
    notifications: rows.map((r) => ({
      id: r.id,
      text: r.text,
      time: r.time_label,
      severity: r.severity,
    })),
    unreadCount: rows.filter((r) => !r.is_read).length,
  });
});

// POST /api/notifications — creates a new notification; `isRead` defaults to false if omitted.
notificationsRouter.post("/", async (req: Request, res: Response) => {
  const b = req.body as Record<string, unknown>;
  if (!requireFields(b, ["text", "time", "severity"], res)) return;

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO notifications (text, time_label, severity, is_read)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [b.text, b.time, b.severity, b.isRead ?? false],
  );
  res.status(201).json({ id: rows[0].id });
});
