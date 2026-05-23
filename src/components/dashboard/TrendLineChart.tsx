"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import { formatTwd } from "@/lib/formatters";
import { PortfolioSnapshotPoint } from "@/types";

function shortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function TrendLineChart({ snapshots }: { snapshots: PortfolioSnapshotPoint[] }) {
  const data = snapshots.map((s) => ({
    label: shortDate(s.snapshotAt),
    總市值: Math.round(s.totalValueTwd),
    台股: Math.round(s.twValueTwd),
    美股: Math.round(s.usValueTwd),
  }));

  return (
    <Card>
      <p className="text-sm font-semibold text-[#6B5344] mb-4">總市值歷史趨勢</p>
      {data.length < 2 ? (
        <p className="text-center text-[#B0A090] text-sm py-8">
          點擊『更新現價』後，趨勢圖將在此顯示
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="#EDE8E0" strokeDasharray="4 4" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9E8E7E" }} />
            <YAxis
              tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}萬`}
              tick={{ fontSize: 11, fill: "#9E8E7E" }}
              width={52}
            />
            <Tooltip formatter={(v) => (typeof v === "number" ? formatTwd(v) : v)} />
            <Legend formatter={(v) => <span className="text-xs text-[#3A3028]">{v}</span>} />
            <Line type="monotone" dataKey="總市值" stroke="#3A3028" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="台股" stroke="#8B9E77" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="美股" stroke="#6B5344" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
