import { GitBranch } from "lucide-react";
import { DeploymentStatsSection } from "@/features/devops/components/DeploymentStatsSection";
import { TeamCompositionCard } from "@/features/devops/components/TeamCompositionCard";

export default function DevOpsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GitBranch size={24} className="text-violet-500" />
        <h1 className="text-xl font-bold text-gray-800">Vue DevOps</h1>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Métriques de déploiement
        </h2>
        <DeploymentStatsSection />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamCompositionCard />
      </section>
    </div>
  );
}
