/**
 * @module services/api/dashboard
 * API service for the Dashboard domain.
 * Handles fetching the dashboard overview and posting new activity entries.
 */
import type { IDashboardOverview, IActivityItem } from "@/types";

/** Base URL read from the Vite environment variable; falls back to same-origin. */
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Fetches the full dashboard overview: KPIs, recent activity, chart data.
 * @returns Resolved overview payload.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchDashboardOverview(): Promise<IDashboardOverview> {
  const res = await fetch(`${BASE_URL}/api/dashboard/overview`);
  if (!res.ok) throw new Error("Failed to fetch dashboard overview");
  return res.json() as Promise<IDashboardOverview>;
}

/**
 * Creates a new activity entry in the dashboard activity feed.
 * @param payload - Activity label, relative timestamp string, and severity level.
 * @returns The database-generated id of the new activity record.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function postActivity(
  payload: Pick<IActivityItem, "label" | "time" | "severity">,
): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/api/dashboard/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to post activity");
  return res.json() as Promise<{ id: number }>;
}
