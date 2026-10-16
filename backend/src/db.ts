/**
 * @module db
 * PostgreSQL connection pool shared across all route handlers.
 * Configuration is driven entirely by environment variables so that the same
 * binary can connect to different databases (local dev, CI, production) without
 * code changes.
 */
import { Pool } from "pg";

/**
 * Singleton `pg.Pool` instance.
 * Import this in route files instead of creating per-request connections.
 */
export const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  database: process.env.DB_NAME ?? "streamflow",
  user: process.env.DB_USER ?? "streamflow",
  password: process.env.DB_PASSWORD ?? "streamflow",
});
