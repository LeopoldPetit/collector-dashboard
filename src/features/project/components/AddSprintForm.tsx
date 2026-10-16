/**
 * Trigger button + modal form for creating a new sprint.
 *
 * Automatically derives `velocityPercent` from the story-points fields so users
 * never have to compute it manually.
 * On successful submission it calls `onSuccess` so the parent can trigger a data refetch.
 */
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { postSprint } from "@/services/api/project";
import type { SprintStatus } from "@/types";

interface AddSprintFormProps {
  /** Callback invoked after a new sprint has been successfully persisted. */
  onSuccess: () => void;
}

/** All valid sprint lifecycle statuses. */
const STATUS_OPTIONS: SprintStatus[] = ["planned", "active", "completed"];

export const AddSprintForm: React.FC<AddSprintFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [planned, setPlanned] = useState("");
  const [done, setDone] = useState("");
  const [status, setStatus] = useState<SprintStatus>("planned");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /** Resets all form fields and clears any error state. */
  const reset = () => {
    setName("");
    setShortName("");
    setPlanned("");
    setDone("");
    setStatus("planned");
    setErr(null);
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim() || !planned || !done) {
      setErr("Tous les champs sont requis.");
      return;
    }
    const storyPointsPlanned = Number(planned);
    const storyPointsDone = Number(done);
    // Derived metric: avoid division-by-zero when planned is 0.
    const velocityPercent =
      storyPointsPlanned > 0
        ? Math.round((storyPointsDone / storyPointsPlanned) * 100)
        : 0;

    setSubmitting(true);
    setErr(null);
    try {
      await postSprint({
        name: name.trim(),
        shortName: shortName.trim(),
        storyPointsPlanned,
        storyPointsDone,
        velocityPercent,
        status,
      });
      // Notify parent so it can call refetch() and refresh the sprint chart.
      onSuccess();
      handleClose();
    } catch {
      setErr("Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
      >
        <Plus size={14} />
        Nouveau sprint
      </button>

      <Modal open={open} onClose={handleClose} title="Nouveau sprint">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sprint 8"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Abréviation
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="S8"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Points planifiés
              </label>
              <input
                type="number"
                min="0"
                value={planned}
                onChange={(e) => setPlanned(e.target.value)}
                placeholder="50"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Points réalisés
              </label>
              <input
                type="number"
                min="0"
                value={done}
                onChange={(e) => setDone(e.target.value)}
                placeholder="45"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SprintStatus)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {err && <p className="text-xs text-red-500">{err}</p>}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Enregistrement…" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
