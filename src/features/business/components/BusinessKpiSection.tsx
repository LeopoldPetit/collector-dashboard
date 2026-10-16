import React from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { useBusinessOverview } from "@/features/business/hooks/useBusinessOverview";
import type { KpiStatus } from "@/types";

function conversionStatus(rate: number): KpiStatus {
  if (rate >= 5) return "ok";
  if (rate >= 3) return "warning";
  return "critical";
}

function churnStatus(rate: number): KpiStatus {
  if (rate < 5) return "ok";
  if (rate < 15) return "warning";
  return "critical";
}

export const BusinessKpiSection: React.FC = () => {
  const { data, loading, error } = useBusinessOverview();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-500">
        Erreur lors du chargement des KPIs business.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Revenu mensuel"
        value={(data.revenue.total / 1000).toFixed(0)}
        unit={`k${data.revenue.currency}`}
        status="ok"
        description={`Période : ${data.revenue.period}`}
      />
      <KpiCard
        title="ARPU"
        value={data.arpu.value.toFixed(2)}
        unit={data.arpu.currency}
        status="ok"
        description={`Prix abonnement : ${data.subscriptionPrice} ${data.arpu.currency}`}
      />
      <KpiCard
        title="Taux de conversion"
        value={data.conversions.conversionRate}
        unit="%"
        status={conversionStatus(data.conversions.conversionRate)}
        description={`${data.conversions.newSubscriptions.toLocaleString()} nouvelles souscriptions`}
      />
      <KpiCard
        title="Taux de churn"
        value={data.churn.churnRate}
        unit="%"
        status={churnStatus(data.churn.churnRate)}
        description={`Rétention : ${data.churn.retentionRate}%`}
      />
    </div>
  );
};
