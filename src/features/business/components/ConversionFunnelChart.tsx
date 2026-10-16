import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useBusinessOverview } from "@/features/business/hooks/useBusinessOverview";

export const ConversionFunnelChart: React.FC = () => {
  const { data, loading, error } = useBusinessOverview();

  if (loading) {
    return <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />;
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-500">
        Erreur lors du chargement du funnel.
      </p>
    );
  }

  const funnelData = [
    { label: "Visiteurs", value: data.conversions.visitors },
    { label: "Souscriptions", value: data.conversions.newSubscriptions },
  ];

  const colors = ["#8b5cf6", "#10b981"];

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        Funnel de conversion
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Taux de conversion : {data.conversions.conversionRate}%
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={funnelData}
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
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
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {funnelData.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
