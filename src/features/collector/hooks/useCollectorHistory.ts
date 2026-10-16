import { useState, useEffect } from "react";
import { fetchCollectorHistory } from "@/services/api/collector";
import type { ICollectorHistory } from "@/types";

/**
 * Fetches the time series of one collector metric.
 * Does nothing while `service` or `name` is null.
 */
export function useCollectorHistory(
  service: string | null,
  name: string | null,
) {
  const [data, setData] = useState<ICollectorHistory | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!service || !name) return;
    let cancelled = false;
    fetchCollectorHistory(service, name)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      });
    return () => {
      cancelled = true;
    };
  }, [service, name]);

  return { data, error };
}
