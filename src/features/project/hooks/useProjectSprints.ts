import { useState, useEffect, useCallback } from "react";
import { fetchProjectSprints } from "@/services/api/project";
import type { IProjectSprintsResponse } from "@/types";

/**
 * Fetches sprint data and summary (velocity, story points planned vs done).
 * Exposes { data, loading, error, refetch }.
 */
export function useProjectSprints() {
  const [data, setData] = useState<IProjectSprintsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    fetchProjectSprints()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));
  }, [tick]);

  return { data, loading, error, refetch };
}
