import { useState, useEffect } from "react";
import { fetchResponseTimes } from "@/services/api/technical";
import type { IResponseTimesResponse } from "@/types";

/**
 * Fetches response time samples and statistics.
 */
export function useResponseTimes() {
  const [data, setData] = useState<IResponseTimesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchResponseTimes()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
