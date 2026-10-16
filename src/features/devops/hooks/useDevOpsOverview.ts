import { useState, useEffect, useCallback } from "react";
import { fetchDevOpsOverview } from "@/services/api/devops";
import type { IDevOpsOverview } from "@/types";

/**
 * Fetches DevOps overview: deployments stats, lead time, team composition.
 * Exposes { data, loading, error, refetch }.
 */
export function useDevOpsOverview() {
  const [data, setData] = useState<IDevOpsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    fetchDevOpsOverview()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));
  }, [tick]);

  return { data, loading, error, refetch };
}
