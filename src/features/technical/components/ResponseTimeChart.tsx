import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useResponseTimes } from "@/features/technical/hooks/useResponseTimes";

export const ResponseTimeChart: React.FC = () => {
  const { data, loading, error } = useResponseTimes();

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Temps de réponse (ms)
      </h3>
      {loading && <div className="h-48 rounded-lg bg-gray-100 animate-pulse" />}
      {error && (
        <p className="text-sm text-red-500">
          Erreur lors du chargement des temps de réponse.
        </p>
      )}
      {data && (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data.samples}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rtGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="index"
                tick={{ fontSize: 11 }}
                label={{
                  value: "Échantillon",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 11,
                }}
              />
              <YAxis tick={{ fontSize: 11 }} unit=" ms" />
              <Tooltip
                formatter={(v) => [
                  typeof v === "number" ? `${v} ms` : v,
                  "Temps de réponse",
                ]}
              />
              <Area
                type="monotone"
                dataKey="ms"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#rtGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
            <div>
              <p className="font-semibold text-gray-800">{data.stats.min} ms</p>
              <p>Min</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {data.stats.average} ms
              </p>
              <p>Moyenne</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{data.stats.p95} ms</p>
              <p>P95</p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
