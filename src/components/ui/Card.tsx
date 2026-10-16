/**
 * Generic card container with configurable padding.
 * Wraps content in a white, rounded panel with a subtle border and shadow.
 */
import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  /** Additional Tailwind classes to merge onto the wrapper element. */
  className?: string;
  /** Padding scale applied to the card body. Defaults to "md". */
  padding?: "sm" | "md" | "lg";
}

// Maps the padding prop to the corresponding Tailwind utility class.
const paddingStyles = {
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
}) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl border border-gray-100 shadow-sm",
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  );
};
