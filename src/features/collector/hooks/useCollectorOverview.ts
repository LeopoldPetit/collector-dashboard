import { useState, useEffect } from "react";
import { fetchCollectorOverview } from "@/services/api/collector";
import type { ICollectorOverview } from "@/types";

/**
 * Fetches the latest value of every collector metric, grouped by service.
 */
export function useCollectorOverview() {
  const [data, setData] = useState<ICollectorOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchCollectorOverview()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
