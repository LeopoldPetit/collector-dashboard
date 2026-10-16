import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/features/collector/components/MetricCard";
import { CollectorMetricHistory } from "@/features/collector/components/CollectorMetricHistory";
import { useCollectorOverview } from "@/features/collector/hooks/useCollectorOverview";

export default function CollectorPage() {
  const { data, loading, error } = useCollectorOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vue Collector</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Qualité, sécurité, tests et performance poussés par les pipelines CI
        </p>
      </div>

      {loading && <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />}
      {error && (
        <p className="text-sm text-red-500">
          Erreur lors du chargement des métriques Collector.
        </p>
      )}

      {data && data.services.length === 0 && (
        <Card>
          <p className="text-sm text-gray-500">
            Aucune métrique reçue. Les pipelines CI doivent pousser leurs
            résultats vers POST /api/collector/metrics.
          </p>
        </Card>
      )}

      {data?.services.map((service) => (
        <section key={service.service} className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            {service.service}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {service.metrics.map((metric) => (
              <MetricCard key={metric.name} metric={metric} />
            ))}
          </div>
        </section>
      ))}

      {data && data.services.length > 0 && (
        <CollectorMetricHistory services={data.services} />
      )}
    </div>
  );
}
