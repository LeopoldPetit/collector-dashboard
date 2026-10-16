import { KpiCard } from "@/components/ui/KpiCard";
import { Card } from "@/components/ui/Card";
import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";
import { AddActivityForm } from "@/features/dashboard/components/AddActivityForm";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const severityColor: Record<string, string> = {
  ok: "bg-emerald-500",
  critical: "bg-red-500",
  info: "bg-violet-500",
  warning: "bg-amber-500",
};

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardOverview();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        Loading dashboard…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-red-500">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} unit={kpi.unit ?? undefined} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Request Volume
              </h2>
              <p className="text-xs text-gray-400">Requests per hour — today</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data.requestVolume}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#reqGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar chart */}
        <Card>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Deployments</h2>
            <p className="text-xs text-gray-400">This week</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.weeklyDeploys}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="deploys" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failures" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Recent Activity
          </h2>
          <AddActivityForm onSuccess={refetch} />
        </div>
        <ul className="divide-y divide-gray-50">
          {data.recentActivity.map((item, i) => (
            <li key={i} className="flex items-start gap-3 py-3">
              <span
                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                  severityColor[item.severity] ?? "bg-gray-400"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-700">{item.label}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {item.time}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
