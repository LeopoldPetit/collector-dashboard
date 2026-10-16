import { useState, useEffect, useCallback } from "react";
import { fetchBusinessUsers } from "@/services/api/business";
import type { IBusinessUsers } from "@/types";

/**
 * Fetches business user statistics: totals, monthly actives, new signups, churn, and monthly evolution.
 * Incrementing `tick` via `refetch` re-runs the effect and re-fetches fresh data.
 * Exposes { data, loading, error, refetch }.
 */
export function useBusinessUsers() {
  const [data, setData] = useState<IBusinessUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    fetchBusinessUsers()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [tick]);

  return { data, loading, error, refetch };
}
