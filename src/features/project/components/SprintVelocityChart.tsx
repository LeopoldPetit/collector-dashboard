import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import type { ISprint } from "@/types";

interface SprintVelocityChartProps {
  sprints: ISprint[];
}

export const SprintVelocityChart: React.FC<SprintVelocityChartProps> = ({
  sprints,
}) => {
  const chartData = sprints.map((s) => ({
    name: s.shortName,
    Planned: s.storyPointsPlanned,
    Done: s.storyPointsDone,
  }));

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Sprint Velocity — Story Points
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Planned" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Done" fill="#7c3aed" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
