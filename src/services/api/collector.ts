/**
 * @module services/api/collector
 * API service for the Collector domain: CI metrics of the collector-shop project.
 */
import type { ICollectorHistory, ICollectorOverview } from "@/types";

/** Base URL read from the Vite environment variable; falls back to same-origin. */
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Fetches the latest value of every collector metric, grouped by service.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchCollectorOverview(): Promise<ICollectorOverview> {
  const res = await fetch(`${BASE_URL}/api/collector/overview`);
  if (!res.ok) throw new Error("Failed to fetch collector overview");
  return res.json() as Promise<ICollectorOverview>;
}

/**
 * Fetches the recent time series of one metric.
 * @param service - Service that owns the metric (e.g. `catalog-api`).
 * @param name - Metric name (e.g. `coverage.lines`).
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchCollectorHistory(
  service: string,
  name: string,
): Promise<ICollectorHistory> {
  const params = new URLSearchParams({ service, name });
  const res = await fetch(`${BASE_URL}/api/collector/history?${params}`);
  if (!res.ok) throw new Error("Failed to fetch collector history");
  return res.json() as Promise<ICollectorHistory>;
}
