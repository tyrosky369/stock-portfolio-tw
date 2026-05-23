"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "neutral";
}

export default function Badge({ children, variant = "neutral" }: BadgeProps) {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    neutral: "bg-[#EDE8E0] text-[#6B5344]",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}
