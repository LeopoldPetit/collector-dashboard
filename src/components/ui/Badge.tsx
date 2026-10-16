/**
 * Inline status badge with colour-coded variants.
 * Used throughout the dashboard to surface OK / warning / critical states at a glance.
 */
import React from "react";
import { clsx } from "clsx";

interface BadgeProps {
  /** Visual variant that drives the colour scheme. Defaults to "default". */
  variant?: "ok" | "warning" | "critical" | "info" | "default";
  children: React.ReactNode;
  /** Additional Tailwind classes to merge onto the badge element. */
  className?: string;
}

// Tailwind class sets for each variant, including border for definition on white backgrounds.
const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  ok: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border border-amber-200",
  critical: "bg-red-100 text-red-700 border border-red-200",
  info: "bg-blue-100 text-blue-700 border border-blue-200",
  default: "bg-gray-100 text-gray-600 border border-gray-200",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className,
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};
