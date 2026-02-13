"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "shiny" | "mirror" | "dynamax" | "legendary" | "team";
  className?: string;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-700",
  shiny: "bg-amber-100 text-amber-800",
  mirror: "bg-green-100 text-green-800",
  dynamax: "bg-pink-100 text-pink-800",
  legendary: "bg-gradient-to-r from-amber-200 to-orange-200 text-orange-900",
  team: "bg-blue-100 text-blue-800",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
