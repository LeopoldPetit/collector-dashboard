/**
 * @module services/api/business
 * API service for the Business domain.
 * Covers revenue/conversion overview data and user statistics management.
 */
import type { IBusinessOverview, IBusinessUsers } from "@/types";

/** Base URL read from the Vite environment variable; falls back to same-origin. */
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Fetches the business overview: revenue KPIs, conversion funnel, and MRR trends.
 * @returns Resolved business overview payload.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchBusinessOverview(): Promise<IBusinessOverview> {
  const res = await fetch(`${BASE_URL}/api/business/overview`);
  if (!res.ok) throw new Error("Failed to fetch business overview");
  return res.json() as Promise<IBusinessOverview>;
}

/**
 * Fetches current user statistics: totals, actives, new signups, and churn.
 * @returns Resolved business-users payload.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchBusinessUsers(): Promise<IBusinessUsers> {
  const res = await fetch(`${BASE_URL}/api/business/users`);
  if (!res.ok) throw new Error("Failed to fetch business users");
  return res.json() as Promise<IBusinessUsers>;
}

/**
 * Persists an updated user-stats snapshot (called after inline edit in the UI).
 * Explicitly enumerates the payload fields to avoid sending extra properties.
 * @param payload - Full user-stats object from the current state.
 * @returns The database-generated id of the new record.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function postBusinessUsers(
  payload: IBusinessUsers["users"],
): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/api/business/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      total: payload.total,
      activeMonthly: payload.activeMonthly,
      startOfMonth: payload.startOfMonth,
      endOfMonth: payload.endOfMonth,
      newThisMonth: payload.newThisMonth,
      churnedThisMonth: payload.churnedThisMonth,
    }),
  });
  if (!res.ok) throw new Error("Failed to post business users");
  return res.json() as Promise<{ id: number }>;
}
