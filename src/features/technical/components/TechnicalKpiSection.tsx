import React from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { useTechnicalOverview } from "@/features/technical/hooks/useTechnicalOverview";
import type { KpiStatus } from "@/types";

function uptimeStatus(percent: number): KpiStatus {
  if (percent >= 99.5) return "ok";
  if (percent >= 98) return "warning";
  return "critical";
}

function errorRateStatus(rate: number): KpiStatus {
  if (rate < 1) return "ok";
  if (rate < 5) return "warning";
  return "critical";
}

function mttrStatus(hours: number): KpiStatus {
  if (hours < 1) return "ok";
  if (hours < 3) return "warning";
  return "critical";
}

function responseStatus(avg: number): KpiStatus {
  if (avg < 300) return "ok";
  if (avg < 800) return "warning";
  return "critical";
}

export const TechnicalKpiSection: React.FC = () => {
  const { data, loading, error } = useTechnicalOverview();

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
        Erreur lors du chargement des KPIs techniques.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Disponibilité (Uptime)"
        value={data.uptime.uptimePercent}
        unit="%"
        status={uptimeStatus(data.uptime.uptimePercent)}
        description={`${data.uptime.downtimeHours}h downtime sur 30j`}
      />
      <KpiCard
        title="Taux d'erreur"
        value={data.errorRate}
        unit="%"
        status={errorRateStatus(data.errorRate)}
        description={`${data.errorRequests.toLocaleString()} erreurs / ${(
          data.totalRequests / 1000
        ).toFixed(0)}k req`}
      />
      <KpiCard
        title="MTTR moyen"
        value={data.mttr.averageHours}
        unit={data.mttr.unit}
        status={mttrStatus(data.mttr.averageHours)}
        description="Mean Time To Resolve"
      />
      <KpiCard
        title="Temps de réponse moyen"
        value={data.responseTimes.average}
        unit={data.responseTimes.unit}
        status={responseStatus(data.responseTimes.average)}
        description={`P95 : ${data.responseTimes.p95} ms`}
      />
    </div>
  );
};
