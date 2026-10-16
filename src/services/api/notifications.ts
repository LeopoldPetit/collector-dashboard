/**
 * @module services/api/notifications
 * API service for the Notifications domain.
 * Fetches the notification list and unread count from the backend.
 */
import type { INotificationsResponse } from "@/types";

/** Base URL read from the Vite environment variable; falls back to same-origin. */
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Fetches all notifications and the global unread count.
 * @returns Resolved notifications payload.
 * @throws {Error} When the HTTP response is not OK.
 */
export async function fetchNotifications(): Promise<INotificationsResponse> {
  const res = await fetch(`${BASE_URL}/api/notifications`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json() as Promise<INotificationsResponse>;
}
