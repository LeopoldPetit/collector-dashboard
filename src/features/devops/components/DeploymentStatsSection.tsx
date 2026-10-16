import React from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { useDevOpsOverview } from "@/features/devops/hooks/useDevOpsOverview";
import type { KpiStatus } from "@/types";

function failureRateStatus(rate: number): KpiStatus {
  if (rate < 15) return "ok";
  if (rate < 25) return "warning";
  return "critical";
}

function leadTimeStatus(days: number): KpiStatus {
  if (days <= 3) return "ok";
  if (days <= 7) return "warning";
  return "critical";
}

function frequencyStatus(freq: number): KpiStatus {
  if (freq >= 1) return "ok";
  if (freq >= 0.5) return "warning";
  return "critical";
}

function successRateStatus(rate: number): KpiStatus {
  if (rate >= 90) return "ok";
  if (rate >= 75) return "warning";
  return "critical";
}

export const DeploymentStatsSection: React.FC = () => {
  const { data, loading, error } = useDevOpsOverview();

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
        Erreur lors du chargement des métriques DevOps.
      </p>
    );
  }

  const { deployments, leadTime } = data;
  const successRate = (deployments.successful / deployments.total) * 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Taux de succès des déploiements"
        value={Math.round(successRate)}
        unit="%"
        status={successRateStatus(successRate)}
        description={`${deployments.successful} / ${deployments.total} déploiements réussis`}
      />
      <KpiCard
        title="Change Failure Rate"
        value={deployments.changeFailureRate}
        unit="%"
        status={failureRateStatus(deployments.changeFailureRate)}
        description={`${deployments.failed} échecs sur ${deployments.periodDays} jours`}
      />
      <KpiCard
        title="Fréquence de déploiement"
        value={deployments.frequencyPerDay}
        unit="/j"
        status={frequencyStatus(deployments.frequencyPerDay)}
        description={`Sur les ${deployments.periodDays} derniers jours`}
      />
      <KpiCard
        title="Lead Time"
        value={leadTime.averageDays}
        unit={leadTime.unit}
        status={leadTimeStatus(leadTime.averageDays)}
        description="Durée moyenne commit → production"
      />
    </div>
  );
};
