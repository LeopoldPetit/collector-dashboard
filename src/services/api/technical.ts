/**
 * @module services/api/technical
 * API service for the Technical domain.
 * Covers system health KPIs, incident management, and response-time metrics.
 */
import type {
  ITechnicalOverview,
  ITechnicalIncidentsResponse,
  IResponseTimesResponse,
  ITechnicalIncident,
} from "@/types";

/** Base URL read from the Vite environment variable; falls back to same-origin. */
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Fetches technical KPI overview: uptime, error rate, and performance indicators.
 * @returns Resolved technical overview payload.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchTechnicalOverview(): Promise<ITechnicalOverview> {
  const res = await fetch(`${BASE_URL}/api/technical/overview`);
  if (!res.ok) throw new Error("Failed to fetch technical overview");
  return res.json() as Promise<ITechnicalOverview>;
}

/**
 * Fetches the paginated list of technical incidents.
 * @returns Incident list with metadata.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchTechnicalIncidents(): Promise<ITechnicalIncidentsResponse> {
  const res = await fetch(`${BASE_URL}/api/technical/incidents`);
  if (!res.ok) throw new Error("Failed to fetch technical incidents");
  return res.json() as Promise<ITechnicalIncidentsResponse>;
}

/**
 * Fetches historical API response-time data points for the chart.
 * @returns Time-series response-time entries.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchResponseTimes(): Promise<IResponseTimesResponse> {
  const res = await fetch(`${BASE_URL}/api/technical/response-times`);
  if (!res.ok) throw new Error("Failed to fetch response times");
  return res.json() as Promise<IResponseTimesResponse>;
}

/**
 * Creates a new incident record.
 * @param payload - Incident data without the server-generated id.
 * @returns The database-generated id of the created incident.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function postIncident(
  payload: Omit<ITechnicalIncident, "id">,
): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/api/technical/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to post incident");
  return res.json() as Promise<{ id: number }>;
}
