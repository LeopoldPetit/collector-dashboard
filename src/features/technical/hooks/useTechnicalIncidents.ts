import { useState, useEffect, useCallback } from "react";
import { fetchTechnicalIncidents } from "@/services/api/technical";
import type { ITechnicalIncidentsResponse } from "@/types";

/**
 * Fetches the list of technical incidents and their summary.
 * Exposes { data, loading, error, refetch }.
 */
export function useTechnicalIncidents() {
  const [data, setData] = useState<ITechnicalIncidentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    fetchTechnicalIncidents()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));
  }, [tick]);

  return { data, loading, error, refetch };
}
