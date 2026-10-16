/**
 * Metric card displaying a single KPI with its status, value, unit, trend, and description.
 * Renders a coloured {@link Badge} for the status and directional trend icons.
 */
import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { IKpiCard, KpiStatus } from "@/types";

type KpiCardProps = IKpiCard;

/** Human-readable labels for each KPI status value. */
const statusLabel: Record<KpiStatus, string> = {
  ok: "OK",
  warning: "Warning",
  critical: "Critical",
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  status,
  trend,
  description,
}) => {
  // Select the appropriate trend icon based on direction (undefined = neutral).
  const trendIcon =
    trend === undefined ? (
      <Minus size={14} />
    ) : trend > 0 ? (
      <TrendingUp size={14} />
    ) : (
      <TrendingDown size={14} />
    );

  // Positive trends are green, negative are red, neutral is gray.
  const trendColor =
    trend === undefined
      ? "text-gray-400"
      : trend > 0
        ? "text-emerald-600"
        : "text-red-500";

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <Badge variant={status}>{statusLabel[status]}</Badge>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-400 mb-1">{unit}</span>}
      </div>
      {(trend !== undefined || description) && (
        <div className="mt-3 flex items-center gap-1">
          {trend !== undefined && (
            <span
              className={clsx(
                "flex items-center gap-0.5 text-xs font-medium",
                trendColor,
              )}
            >
              {trendIcon}
              {Math.abs(trend)}%
            </span>
          )}
          {description && (
            <span className="text-xs text-gray-400">{description}</span>
          )}
        </div>
      )}
    </Card>
  );
};
