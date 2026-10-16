/**
 * Trigger button + modal form for creating a new dashboard activity entry.
 *
 * Renders a small "Ajouter" button that opens a {@link Modal}.
 * On successful submission it calls `onSuccess` so the parent can trigger a data refetch.
 */
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { postActivity } from "@/services/api/dashboard";
import type { IActivityItem } from "@/types";

interface AddActivityFormProps {
  /** Callback invoked after a new activity has been successfully persisted. */
  onSuccess: () => void;
}

/** All valid severity levels for an activity item. */
const SEVERITY_OPTIONS: IActivityItem["severity"][] = [
  "info",
  "ok",
  "warning",
  "critical",
];

export const AddActivityForm: React.FC<AddActivityFormProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("");
  const [severity, setSeverity] = useState<IActivityItem["severity"]>("info");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /** Resets all form fields and clears any error state. */
  const reset = () => {
    setLabel("");
    setTime("");
    setSeverity("info");
    setErr(null);
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !time.trim()) {
      setErr("Tous les champs sont requis.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await postActivity({ label: label.trim(), time: time.trim(), severity });
      // Notify parent so it can call refetch() and refresh the activity feed.
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
        Ajouter
      </button>

      <Modal open={open} onClose={handleClose} title="Nouvelle activité">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Deploy #44 — main branch"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Temps</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="5 min ago"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Sévérité
            </label>
            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value as IActivityItem["severity"])
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
