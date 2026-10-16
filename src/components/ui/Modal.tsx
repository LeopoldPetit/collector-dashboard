/**
 * Reusable modal overlay component.
 *
 * Features:
 * - Closes on Escape key press.
 * - Closes when clicking the dark backdrop.
 * - Stops click propagation on the inner panel to prevent accidental dismissal.
 * - Renders nothing when `open` is false (avoids mounting cost).
 */
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Callback invoked when the modal should close (Escape, backdrop click, or close button). */
  onClose: () => void;
  /** Text displayed in the modal header. */
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  // Register a keyboard listener only while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Backdrop — clicking it closes the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — stops propagation so clicks inside don't bubble to the backdrop. */}
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
