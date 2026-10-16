/**
 * Trigger button + modal form for creating a new technical incident.
 *
 * Renders a red-tinted "Ajouter" button that opens a {@link Modal}.
 * On successful submission it calls `onSuccess` so the parent can trigger a data refetch.
 */
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { postIncident } from "@/services/api/technical";
import type { ITechnicalIncident } from "@/types";

interface AddIncidentFormProps {
  /** Callback invoked after a new incident has been successfully persisted. */
  onSuccess: () => void;
}

/** All valid severity levels for a technical incident. */
const SEVERITY_OPTIONS: ITechnicalIncident["severity"][] = [
  "low",
  "medium",
  "high",
  "critical",
];

/** All valid lifecycle statuses for a technical incident. */
const STATUS_OPTIONS: ITechnicalIncident["status"][] = [
  "open",
  "in_progress",
  "resolved",
];

export const AddIncidentForm: React.FC<AddIncidentFormProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [severity, setSeverity] =
    useState<ITechnicalIncident["severity"]>("medium");
  const [status, setStatus] = useState<ITechnicalIncident["status"]>("open");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /** Resets all form fields and clears any error state. */
  const reset = () => {
    setTitle("");
    setDurationHours("");
    setDurationMinutes("");
    setSeverity("medium");
    setStatus("open");
    setErr(null);
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !durationHours || !durationMinutes) {
      setErr("Tous les champs sont requis.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await postIncident({
        title: title.trim(),
        durationHours: Number(durationHours),
        durationMinutes: Number(durationMinutes),
        severity,
        status,
      });
      // Notify parent so it can call refetch() and refresh the incident list.
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
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
      >
        <Plus size={14} />
        Ajouter
      </button>

      <Modal open={open} onClose={handleClose} title="Nouvel incident">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="DB connection timeout"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Durée (heures)
              </label>
              <input
                type="number"
                min="0"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                placeholder="2"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Durée (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="30"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Sévérité
              </label>
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as ITechnicalIncident["severity"])
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ITechnicalIncident["status"])
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
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
              {submitting ? "Enregistrement…" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
