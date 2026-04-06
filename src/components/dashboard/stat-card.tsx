import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "teal" | "default";
}

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", icon: "bg-blue-100 text-blue-600", border: "border-blue-100" },
  green: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", border: "border-emerald-100" },
  purple: { bg: "bg-violet-50", icon: "bg-violet-100 text-violet-600", border: "border-violet-100" },
  orange: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-600", border: "border-orange-100" },
  pink: { bg: "bg-pink-50", icon: "bg-pink-100 text-pink-600", border: "border-pink-100" },
  teal: { bg: "bg-teal-50", icon: "bg-teal-100 text-teal-600", border: "border-teal-100" },
  default: { bg: "bg-white", icon: "bg-gray-100 text-gray-600", border: "border-gray-200/80" },
};

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  color = "default",
}: StatCardProps) {
  const c = COLOR_MAP[color];

  return (
    <div className={cn(
      "rounded-2xl border p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.03)] transition-all",
      c.bg, c.border
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs",
                changeType === "positive" && "text-green-600",
                changeType === "negative" && "text-red-600",
                changeType === "neutral" && "text-gray-500"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", c.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
