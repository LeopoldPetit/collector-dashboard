import { TechnicalKpiSection } from "@/features/technical/components/TechnicalKpiSection";
import { ResponseTimeChart } from "@/features/technical/components/ResponseTimeChart";
import { IncidentsTable } from "@/features/technical/components/IncidentsTable";

export default function TechnicalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vue Technique</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Supervision des indicateurs système — 30 derniers jours
        </p>
      </div>

      <TechnicalKpiSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponseTimeChart />
        <IncidentsTable />
      </div>
    </div>
  );
}
