"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import { formatTwd } from "@/lib/formatters";

const COLORS = ["#6B5344", "#C8B8A2", "#8B9E77", "#A89880", "#D4B8A0", "#B5C4A1"];

interface Props {
  holdings: { ticker: string; stockName: string; valueTwd: number }[];
}

export default function PieChartUS({ holdings }: Props) {
  const data = holdings.map((h) => ({ name: `${h.ticker}`, value: h.valueTwd }));

  return (
    <Card>
      <p className="text-sm font-semibold text-[#6B5344] mb-4">美股持股分布</p>
      {data.length === 0 ? (
        <p className="text-center text-[#B0A090] text-sm py-8">尚無持股</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => (typeof v === "number" ? formatTwd(v) : v)} />
            <Legend
              formatter={(v) => (
                <span className="text-xs text-[#3A3028]">{v}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
