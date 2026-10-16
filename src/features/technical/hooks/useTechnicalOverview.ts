import { useState, useEffect } from "react";
import { fetchTechnicalOverview } from "@/services/api/technical";
import type { ITechnicalOverview } from "@/types";

/**
 * Fetches technical overview KPIs: uptime, error rate, MTTR, response times.
 */
export function useTechnicalOverview() {
  const [data, setData] = useState<ITechnicalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTechnicalOverview()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
