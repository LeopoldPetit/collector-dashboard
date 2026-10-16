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
import { useBusinessUsers } from "@/features/business/hooks/useBusinessUsers";

export const UserEvolutionChart: React.FC = () => {
  const { data, loading, error } = useBusinessUsers();

  if (loading) {
    return <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />;
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-500">
        Erreur lors du chargement de l'évolution utilisateurs.
      </p>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Évolution des utilisateurs (mensuelle)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data.evolution}
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(v) => [
              typeof v === "number" ? v.toLocaleString() : v,
              "Utilisateurs",
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#userGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
