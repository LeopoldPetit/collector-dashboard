import { useState, useEffect, useCallback } from "react";
import { fetchDashboardOverview } from "@/services/api/dashboard";
import type { IDashboardOverview } from "@/types";

/**
 * Fetches the full dashboard overview (KPIs, charts, activity).
 * Exposes { data, loading, error, refetch }.
 */
export function useDashboardOverview() {
  const [data, setData] = useState<IDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    fetchDashboardOverview()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));
  }, [tick]);

  return { data, loading, error, refetch };
}
