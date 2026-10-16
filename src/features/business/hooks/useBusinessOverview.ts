import { useState, useEffect } from "react";
import { fetchBusinessOverview } from "@/services/api/business";
import type { IBusinessOverview } from "@/types";

/**
 * Fetches the business overview: revenue, ARPU, conversion rates, and churn metrics.
 * Exposes { data, loading, error }.
 */
export function useBusinessOverview() {
  const [data, setData] = useState<IBusinessOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchBusinessOverview()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
