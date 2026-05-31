"use client";

import { MemberSummary } from "@/types";
import { formatTwd } from "@/lib/formatters";
import { useMember } from "@/contexts/MemberContext";
import { PieChart, Pie, Cell } from "recharts";

const TW_COLOR = "#8B9E77";
const US_COLOR = "#6B5344";

function MiniDonut({ twValue, usValue }: { twValue: number; usValue: number }) {
  const data = [
    { value: twValue || 0.001 },
    { value: usValue || 0.001 },
  ];
  return (
    <PieChart width={44} height={44}>
      <Pie data={data} cx={20} cy={20} innerRadius={12} outerRadius={20} dataKey="value" strokeWidth={0}>
        <Cell fill={TW_COLOR} />
        <Cell fill={US_COLOR} />
      </Pie>
    </PieChart>
  );
}

export default function MemberSummaryRow({ summaries }: { summaries: MemberSummary[] }) {
  const { setSelectedOwner } = useMember();

  if (summaries.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {summaries.map((m) => {
        const total = m.totalValueTwd;
        const twPct = total > 0 ? (m.twValueTwd / total) * 100 : 0;
        const usPct = total > 0 ? (m.usValueTwd / total) * 100 : 0;

        return (
          <button
            key={m.owner}
            onClick={() => setSelectedOwner(m.owner)}
            className="bg-white border border-[#E8E0D4] rounded-2xl p-4 text-left hover:border-[#C8B8A2] hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#3A3028] group-hover:text-[#6B5344] transition-colors">
                {m.owner}
              </span>
              <MiniDonut twValue={m.twValueTwd} usValue={m.usValueTwd} />
            </div>
            <p className="text-base font-bold text-[#3A3028]">{formatTwd(total)}</p>
            <div className="flex gap-3 mt-1.5">
              <span className="text-xs text-[#8B9E77]">台 {twPct.toFixed(0)}%</span>
              <span className="text-xs text-[#6B5344]">美 {usPct.toFixed(0)}%</span>
            </div>
            {m.pnlTwd !== null && (
              <p className={`text-xs font-medium mt-1 ${m.pnlTwd >= 0 ? "text-green-600" : "text-red-500"}`}>
                {m.pnlTwd >= 0 ? "+" : ""}{formatTwd(m.pnlTwd)}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
