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
  blue: { iconBg: "#D4FF3A18", iconColor: "#8A9A00" },
  green: { iconBg: "#10B98118", iconColor: "#10B981" },
  purple: { iconBg: "#8B5CF618", iconColor: "#8B5CF6" },
  orange: { iconBg: "#FF7A4518", iconColor: "#FF7A45" },
  pink: { iconBg: "#EC489918", iconColor: "#EC4899" },
  teal: { iconBg: "#14B8A618", iconColor: "#14B8A6" },
  default: { iconBg: "#D4FF3A18", iconColor: "#8A9A00" },
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
    <div
      className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82", letterSpacing: "0.08em" }}
          >
            {title}
          </p>
          <p
            className="mt-2 text-3xl font-normal"
            style={{ fontFamily: "'Instrument Serif', serif", color: "#0A0A0A", lineHeight: 1 }}
          >
            {value}
          </p>
          {change && (
            <p
              className="mt-2 text-xs font-semibold"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
                color: changeType === "positive" ? "#10B981" : changeType === "negative" ? "#FF7A45" : "#8A8A82",
              }}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: c.iconBg }}
        >
          <Icon className="h-5 w-5" style={{ color: c.iconColor }} />
        </div>
      </div>
    </div>
  );
}
