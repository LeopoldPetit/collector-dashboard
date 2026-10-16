import { useState, useEffect } from "react";
import { fetchProjectOverview } from "@/services/api/project";
import type { IProjectOverview } from "@/types";

/**
 * Fetches the project overview KPIs (bugs, features, fix rate).
 */
export function useProjectOverview() {
  const [data, setData] = useState<IProjectOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProjectOverview()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
