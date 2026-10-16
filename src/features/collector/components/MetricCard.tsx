import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { CollectorStatus, ICollectorMetric } from "@/types";

const statusLabel: Record<CollectorStatus, string> = {
  ok: "OK",
  warning: "Attention",
  critical: "Critique",
  info: "Info",
};

/** Formats integers as-is and decimals with two digits. */
function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

interface MetricCardProps {
  metric: ICollectorMetric;
}

/** Card showing one collector metric with its status and source commit. */
export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => (
  <Card>
    <div className="flex items-start justify-between gap-2 mb-3">
      <p className="text-sm font-medium text-gray-500 break-all">
        {metric.name}
      </p>
      <Badge variant={metric.status}>{statusLabel[metric.status]}</Badge>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-3xl font-bold text-gray-900">
        {formatValue(metric.value)}
      </span>
      {metric.unit && (
        <span className="text-sm text-gray-400 mb-1">{metric.unit}</span>
      )}
    </div>
    <p className="mt-3 text-xs text-gray-400">
      {metric.category} · {new Date(metric.recordedAt).toLocaleString("fr-FR")}
      {metric.commitSha ? ` · ${metric.commitSha.slice(0, 7)}` : ""}
    </p>
  </Card>
);
