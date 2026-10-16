import {
  Bug,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Layers,
} from "lucide-react";
import { clsx } from "clsx";

import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { SprintVelocityChart } from "@/features/project/components/SprintVelocityChart";
import { AddSprintForm } from "@/features/project/components/AddSprintForm";
import { useProjectOverview } from "@/features/project/hooks/useProjectOverview";
import { useProjectSprints } from "@/features/project/hooks/useProjectSprints";
import type { ISprintSummary } from "@/types";

function TrendIcon({ trend }: { trend: ISprintSummary["trend"] }) {
  if (trend === "increasing")
    return <TrendingUp size={16} className="text-emerald-500" />;
  if (trend === "declining")
    return <TrendingDown size={16} className="text-red-500" />;
  return <Minus size={16} className="text-gray-400" />;
}

export default function ProjectsPage() {
  const {
    data: overview,
    loading: loadingOverview,
    error: errorOverview,
  } = useProjectOverview();
  const {
    data: sprints,
    loading: loadingSprints,
    error: errorSprints,
    refetch: refetchSprints,
  } = useProjectSprints();

  const isLoading = loadingOverview || loadingSprints;
  const hasError = errorOverview ?? errorSprints;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading project data…
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        Error: {hasError.message}
      </div>
    );
  }

  const fixRateStatus =
    overview!.bugs.fixRate >= 75
      ? "ok"
      : overview!.bugs.fixRate >= 50
        ? "warning"
        : "critical";

  const velocityStatus =
    sprints!.summary.averageVelocityPercent >= 80
      ? "ok"
      : sprints!.summary.averageVelocityPercent >= 60
        ? "warning"
        : "critical";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Projects</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Monthly overview — bugs, features &amp; sprint velocity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Bugs Detected"
          value={overview!.bugs.detected}
          unit="bugs"
          status="warning"
          description="this month"
        />
        <KpiCard
          title="Bugs Fixed"
          value={overview!.bugs.fixed}
          unit="bugs"
          status="ok"
          description={`${overview!.bugs.open} still open`}
        />
        <KpiCard
          title="Fix Rate"
          value={`${overview!.bugs.fixRate}%`}
          unit=""
          status={fixRateStatus}
          description="bugs resolved vs detected"
        />
        <KpiCard
          title="Features Delivered"
          value={overview!.features.delivered}
          unit="features"
          status="ok"
          description={`bug rate: ${overview!.features.bugRate}%`}
        />
      </div>

      {/* Sprint Velocity Chart + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SprintVelocityChart sprints={sprints!.sprints} />
        </div>

        <Card className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Sprint Summary
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Total Planned</span>
              <span className="text-sm font-semibold text-gray-800">
                {sprints!.summary.totalPlanned} pts
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Total Done</span>
              <span className="text-sm font-semibold text-gray-800">
                {sprints!.summary.totalDone} pts
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Avg Velocity</span>
              <Badge variant={velocityStatus}>
                {sprints!.summary.averageVelocityPercent}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Trend</span>
              <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <TrendIcon trend={sprints!.summary.trend} />
                {sprints!.summary.trend}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sprint Detail Table */}
      <Card>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-violet-500" />
            <h3 className="text-sm font-semibold text-gray-700">
              Sprint Details
            </h3>
          </div>
          <AddSprintForm onSuccess={refetchSprints} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Sprint
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Planned
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Done
                </th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Velocity
                </th>
                <th className="text-center py-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sprints!.sprints.map((sprint) => {
                const vStatus =
                  sprint.velocityPercent >= 80
                    ? "ok"
                    : sprint.velocityPercent >= 60
                      ? "warning"
                      : "critical";
                return (
                  <tr
                    key={sprint.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-gray-800">
                      {sprint.name}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-600">
                      {sprint.storyPointsPlanned} pts
                    </td>
                    <td className="py-3 px-3 text-right text-gray-600">
                      {sprint.storyPointsDone} pts
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={clsx(
                          "font-semibold",
                          vStatus === "ok"
                            ? "text-emerald-600"
                            : vStatus === "warning"
                              ? "text-amber-600"
                              : "text-red-600",
                        )}
                      >
                        {sprint.velocityPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge
                        variant={sprint.status === "completed" ? "ok" : "info"}
                      >
                        {sprint.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bug Overview */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bug size={16} className="text-red-500" />
          <h3 className="text-sm font-semibold text-gray-700">Bug Overview</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-red-50 border border-red-100">
            <span className="text-2xl font-bold text-red-600">
              {overview!.bugs.detected}
            </span>
            <span className="text-xs text-red-400 font-medium">Detected</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <span className="flex items-center gap-1 text-2xl font-bold text-emerald-600">
              <CheckCircle size={18} />
              {overview!.bugs.fixed}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Fixed</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-amber-50 border border-amber-100">
            <span className="text-2xl font-bold text-amber-600">
              {overview!.bugs.open}
            </span>
            <span className="text-xs text-amber-400 font-medium">
              Still Open
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
