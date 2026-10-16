import { useState, useEffect } from "react";
import { fetchNotifications } from "@/services/api/notifications";
import type { INotificationsResponse } from "@/types";

/**
 * Fetches the notifications list and unread count.
 * Exposes { data, loading, error }.
 */
export function useNotifications() {
  const [data, setData] = useState<INotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchNotifications()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
