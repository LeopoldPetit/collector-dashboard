import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useCollectorHistory } from "@/features/collector/hooks/useCollectorHistory";
import type { ICollectorService } from "@/types";

interface CollectorMetricHistoryProps {
  services: ICollectorService[];
}

/** Line chart of one metric over time, with a selector over all pushed metrics. */
export const CollectorMetricHistory: React.FC<CollectorMetricHistoryProps> = ({
  services,
}) => {
  const options = useMemo(
    () =>
      services.flatMap((s) =>
        s.metrics.map((m) => ({
          key: `${s.service}|${m.name}`,
          service: s.service,
          name: m.name,
          unit: m.unit,
        })),
      ),
    [services],
  );

  const [selectedKey, setSelectedKey] = useState<string>("");
  const current =
    options.find((o) => o.key === selectedKey) ?? options[0] ?? null;
  const { data, error } = useCollectorHistory(
    current?.service ?? null,
    current?.name ?? null,
  );

  // Ignore a response that belongs to a previously selected metric.
  const points =
    data &&
    current &&
    data.service === current.service &&
    data.name === current.name
      ? data.points.map((p) => ({
          time: new Date(p.recordedAt).toLocaleDateString("fr-FR"),
          value: p.value,
        }))
      : [];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Historique {current ? `— ${current.service} / ${current.name}` : ""}
        </h3>
        {options.length > 0 && (
          <select
            aria-label="Métrique"
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
            value={current?.key ?? ""}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.service} — {o.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">
          Erreur lors du chargement de l'historique.
        </p>
      )}
      {!error && points.length === 0 && (
        <p className="text-sm text-gray-500">Pas encore assez de points.</p>
      )}
      {points.length > 0 && (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={points}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              unit={current?.unit ? ` ${current.unit}` : ""}
            />
            <Tooltip formatter={(v) => [String(v), current?.name ?? ""]} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};
