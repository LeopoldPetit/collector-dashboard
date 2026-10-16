/**
 * @file TeamCompositionCard.tsx
 * Displays the DevOps team headcount broken down by role.
 * Each role row exposes +/- buttons that immediately persist the updated count
 * by POSTing the full current DevOps overview snapshot to the backend.
 */
import React, { useState } from "react";
import { Users, Code2, Settings2, Briefcase, Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useDevOpsOverview } from "@/features/devops/hooks/useDevOpsOverview";
import { postDevOpsOverview } from "@/services/api/devops";

/** Union type of team-composition keys to allow generic delta updates. */
type TeamKey = "developers" | "devops" | "productOwner" | "cto";

interface TeamMemberRowProps {
  icon: React.ReactNode;
  label: string;
  /** Current headcount for this role. */
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Disables buttons while a PATCH/POST is in flight. */
  saving: boolean;
}

/**
 * Single row inside the team-composition list.
 * Shows an icon, role name, current count, and increment/decrement controls.
 */
const TeamMemberRow: React.FC<TeamMemberRowProps> = ({
  icon,
  label,
  count,
  onIncrement,
  onDecrement,
  saving,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3 text-gray-600">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrement}
        disabled={saving || count <= 0}
        className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 disabled:opacity-30 transition-colors"
      >
        <Minus size={12} />
      </button>
      <span className="text-sm font-semibold text-gray-800 w-6 text-center">
        {count}
      </span>
      <button
        onClick={onIncrement}
        disabled={saving}
        className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600 disabled:opacity-30 transition-colors"
      >
        <Plus size={12} />
      </button>
    </div>
  </div>
);

export const TeamCompositionCard: React.FC = () => {
  const { data, loading, error, refetch } = useDevOpsOverview();
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />;
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-500">
        Erreur lors du chargement de l'équipe.
      </p>
    );
  }

  const { team, deployments, leadTime } = data;
  const total = team.developers + team.devops + team.productOwner + team.cto;

  /**
   * Applies a delta (+1 / -1) to the given team role, clamps the result to 0,
   * persists the full DevOps snapshot, and triggers a refetch to sync UI state.
   */
  const updateTeam = async (key: TeamKey, delta: number) => {
    const newTeam = { ...team, [key]: Math.max(0, team[key] + delta) };
    setSaving(true);
    try {
      await postDevOpsOverview({
        deployTotal: deployments.total,
        deploySuccessful: deployments.successful,
        deployFailed: deployments.failed,
        changeFailureRate: deployments.changeFailureRate,
        frequencyPerDay: deployments.frequencyPerDay,
        periodDays: deployments.periodDays,
        leadTimeAvgDays: leadTime.averageDays,
        teamDevelopers: newTeam.developers,
        teamDevops: newTeam.devops,
        teamProductOwner: newTeam.productOwner,
        teamCto: newTeam.cto,
      });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  /** Role definitions used to render the team rows declaratively. */
  const rows: { key: TeamKey; icon: React.ReactNode; label: string }[] = [
    { key: "developers", icon: <Code2 size={16} />, label: "Développeurs" },
    { key: "devops", icon: <Settings2 size={16} />, label: "DevOps" },
    {
      key: "productOwner",
      icon: <Briefcase size={16} />,
      label: "Product Owner",
    },
    { key: "cto", icon: <Users size={16} />, label: "CTO" },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Composition de l'équipe
        </h3>
        <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-1 rounded-full">
          {saving ? "…" : `${total} membres`}
        </span>
      </div>
      {rows.map(({ key, icon, label }) => (
        <TeamMemberRow
          key={key}
          icon={icon}
          label={label}
          count={team[key]}
          saving={saving}
          onIncrement={() => updateTeam(key, +1)}
          onDecrement={() => updateTeam(key, -1)}
        />
      ))}
    </Card>
  );
};
