/**
 * @module services/api/devops
 * API service for the DevOps domain.
 * Handles deployment statistics, lead time metrics, and team composition data.
 */
import type { IDevOpsOverview, IDevOpsTeam } from "@/types";

/** Base URL read from the Vite environment variable; falls back to same-origin. */
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Fetches the DevOps overview: deployment stats, lead time, and team composition.
 * @returns Resolved DevOps overview payload.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchDevOpsOverview(): Promise<IDevOpsOverview> {
  const res = await fetch(`${BASE_URL}/api/devops/overview`);
  if (!res.ok) throw new Error("Failed to fetch devops overview");
  return res.json() as Promise<IDevOpsOverview>;
}

/**
 * Persists a full DevOps overview snapshot (used when updating team headcount).
 * Sends a flat payload that the backend maps to the normalised schema.
 * @param payload - Flattened deployment and team fields.
 * @returns The database-generated id of the new record.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function postDevOpsOverview(payload: {
  deployTotal: number;
  deploySuccessful: number;
  deployFailed: number;
  changeFailureRate: number;
  frequencyPerDay: number;
  periodDays: number;
  leadTimeAvgDays: number;
  teamDevelopers: number;
  teamDevops: number;
  teamProductOwner: number;
  teamCto: number;
}): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/api/devops/overview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to post devops overview");
  return res.json() as Promise<{ id: number }>;
}

// Re-exported so consumers can import the team type directly from this module.
export type { IDevOpsTeam };
