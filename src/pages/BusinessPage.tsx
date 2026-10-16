import { BusinessKpiSection } from "@/features/business/components/BusinessKpiSection";
import { UserEvolutionChart } from "@/features/business/components/UserEvolutionChart";
import { UserStatsCard } from "@/features/business/components/UserStatsCard";
import { ConversionFunnelChart } from "@/features/business/components/ConversionFunnelChart";

export default function BusinessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Business</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Indicateurs clés — revenus, utilisateurs & conversions
        </p>
      </div>

      <BusinessKpiSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserEvolutionChart />
        <UserStatsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnelChart />
      </div>
    </div>
  );
}
