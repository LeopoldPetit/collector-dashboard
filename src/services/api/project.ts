/**
 * @module services/api/project
 * API service for the Project domain.
 * Handles sprint and project overview data retrieval, and sprint creation.
 */
import type {
  IProjectOverview,
  IProjectSprintsResponse,
  ISprint,
} from "@/types";

/** Base URL read from the Vite environment variable; falls back to same-origin. */
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Fetches the project overview: burn-down data, team velocity KPIs, and current sprint info.
 * @returns Resolved project overview payload.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchProjectOverview(): Promise<IProjectOverview> {
  const res = await fetch(`${BASE_URL}/api/project/overview`);
  if (!res.ok) throw new Error("Failed to fetch project overview");
  return res.json() as Promise<IProjectOverview>;
}

/**
 * Fetches all sprints along with aggregate velocity summary.
 * @returns Sprint list and computed summary metrics.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchProjectSprints(): Promise<IProjectSprintsResponse> {
  const res = await fetch(`${BASE_URL}/api/project/sprints`);
  if (!res.ok) throw new Error("Failed to fetch project sprints");
  return res.json() as Promise<IProjectSprintsResponse>;
}

/**
 * Creates a new sprint record.
 * `Date.now()` is used as a temporary client-side sprintId; the backend assigns the canonical id.
 * @param payload - Sprint data without the server-generated id.
 * @returns The database-generated id of the created sprint.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function postSprint(
  payload: Omit<ISprint, "id">,
): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/api/project/sprints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sprintId: Date.now(), // temporary client-side id; server will assign the canonical one
      name: payload.name,
      shortName: payload.shortName,
      storyPointsPlanned: payload.storyPointsPlanned,
      storyPointsDone: payload.storyPointsDone,
      velocityPercent: payload.velocityPercent,
      status: payload.status,
    }),
  });
  if (!res.ok) throw new Error("Failed to post sprint");
  return res.json() as Promise<{ id: number }>;
}
