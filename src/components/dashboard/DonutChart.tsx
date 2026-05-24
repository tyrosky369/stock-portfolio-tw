"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import { formatTwd } from "@/lib/formatters";

const COLORS = [
  "#C8B8A2", "#8B9E77", "#6B5344", "#A89880", "#B5C4A1", "#D4C8B8",
  "#9E8E7E", "#7A9068", "#5A4333", "#BCA898",
];

interface Props {
  title: string;
  holdings: { ticker: string; stockName: string; valueTwd: number }[];
  nameFormat?: (ticker: string, stockName: string) => string;
}

interface ActiveInfo {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export default function DonutChart({ title, holdings, nameFormat }: Props) {
  const [active, setActive] = useState<ActiveInfo | null>(null);

  const total = holdings.reduce((s, h) => s + h.valueTwd, 0);

  const data = holdings.map((h) => ({
    name: nameFormat ? nameFormat(h.ticker, h.stockName) : `${h.ticker} ${h.stockName}`,
    value: h.valueTwd,
  }));

  function handleClick(entry: { name?: string; value?: number }, index: number) {
    const name = entry.name ?? "";
    const value = entry.value ?? 0;
    const color = COLORS[index % COLORS.length];
    const percent = total > 0 ? value / total : 0;
    if (active?.name === name) {
      setActive(null);
    } else {
      setActive({ name, value, percent, color });
    }
  }

  return (
    <Card>
      <p className="text-sm font-semibold text-[#6B5344] mb-1">{title}</p>
      {total > 0 && (
        <p className="text-xs text-[#B0A090] mb-3">
          點擊扇形查看佔比・合計 {formatTwd(total)}
        </p>
      )}
      {data.length === 0 ? (
        <p className="text-center text-[#B0A090] text-sm py-8">尚無持股</p>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="46%"
                innerRadius={68}
                outerRadius={100}
                dataKey="value"
                paddingAngle={2}
                onClick={handleClick}
                style={{ cursor: "pointer" }}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    opacity={
                      active === null || active.color === COLORS[i % COLORS.length]
                        ? 1
                        : 0.4
                    }
                    stroke={
                      active?.color === COLORS[i % COLORS.length]
                        ? COLORS[i % COLORS.length]
                        : "transparent"
                    }
                    strokeWidth={active?.color === COLORS[i % COLORS.length] ? 3 : 0}
                  />
                ))}
              </Pie>
              <Legend
                iconSize={10}
                formatter={(v) => (
                  <span className="text-xs text-[#3A3028]">{v}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* 中心 overlay */}
          {active && (
            <div
              className="absolute pointer-events-none flex flex-col items-center justify-center"
              style={{
                top: "10%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 132,
                height: 132,
              }}
            >
              <span
                className="text-xs font-medium text-center leading-tight mb-1 px-1"
                style={{ color: active.color }}
              >
                {active.name.length > 12 ? active.name.slice(0, 12) + "…" : active.name}
              </span>
              <span className="text-2xl font-bold text-[#3A3028]">
                {(active.percent * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-[#9E8E7E] mt-0.5">
                {formatTwd(active.value)}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
