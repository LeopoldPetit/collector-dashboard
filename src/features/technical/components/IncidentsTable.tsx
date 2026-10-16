import React from "react";
import { clsx } from "clsx";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useTechnicalIncidents } from "@/features/technical/hooks/useTechnicalIncidents";
import { AddIncidentForm } from "@/features/technical/components/AddIncidentForm";
import type { ITechnicalIncident } from "@/types";

const severityConfig: Record<
  ITechnicalIncident["severity"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  critical: {
    label: "Critique",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: <AlertCircle size={14} />,
  },
  high: {
    label: "Élevé",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    icon: <AlertTriangle size={14} />,
  },
  medium: {
    label: "Moyen",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: <Info size={14} />,
  },
  low: {
    label: "Faible",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: <CheckCircle size={14} />,
  },
};

export const IncidentsTable: React.FC = () => {
  const { data, loading, error, refetch } = useTechnicalIncidents();

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Incidents (30 derniers jours)
        </h3>
        <AddIncidentForm onSuccess={refetch} />
      </div>
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500">
          Erreur lors du chargement des incidents.
        </p>
      )}
      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Incident</th>
                  <th className="pb-2 font-medium">Sévérité</th>
                  <th className="pb-2 font-medium">Durée</th>
                  <th className="pb-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.incidents.map((incident) => {
                  const cfg = severityConfig[incident.severity];
                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-800">
                        {incident.title}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                            cfg.color,
                          )}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {incident.durationMinutes} min
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle size={12} />
                          Résolu
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
            <div>
              <p className="font-semibold text-gray-800">
                {data.summary.total}
              </p>
              <p>Incidents</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {data.summary.totalDowntimeHours}h
              </p>
              <p>Downtime total</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {data.summary.mttrHours}h
              </p>
              <p>MTTR moyen</p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
