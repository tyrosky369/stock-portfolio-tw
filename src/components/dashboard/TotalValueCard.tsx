"use client";

import { PieChart, Pie, Cell } from "recharts";
import Card from "@/components/ui/Card";
import { formatTwd } from "@/lib/formatters";
import { PortfolioSummary } from "@/types";

const TW_COLOR = "#8B9E77";
const US_COLOR = "#6B5344";

export default function TotalValueCard({ summary }: { summary: PortfolioSummary }) {
  const total = summary.totalValueTwd;
  const twPct = total > 0 ? (summary.twValueTwd / total) * 100 : 0;
  const usPct = total > 0 ? (summary.usValueTwd / total) * 100 : 0;

  const pieData = [
    { name: "台股", value: summary.twValueTwd },
    { name: "美股", value: summary.usValueTwd },
  ];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* 左：圓餅圖 */}
        {total > 0 && (
          <div className="relative flex-shrink-0">
            <PieChart width={120} height={120}>
              <Pie
                data={pieData}
                cx={55}
                cy={55}
                innerRadius={36}
                outerRadius={54}
                dataKey="value"
                paddingAngle={2}
                strokeWidth={0}
              >
                <Cell fill={TW_COLOR} />
                <Cell fill={US_COLOR} />
              </Pie>
            </PieChart>
            {/* 凡例 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] text-[#8B9E77] font-semibold leading-none">{twPct.toFixed(0)}%</p>
                <p className="text-[8px] text-[#C8B8A2] leading-none my-0.5">╱</p>
                <p className="text-[10px] text-[#6B5344] font-semibold leading-none">{usPct.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* 右：數字區 */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs text-[#9E8E7E] mb-1 tracking-widest uppercase">總市值</p>
          <p className="text-4xl font-bold text-[#3A3028] mb-4">
            {formatTwd(total)}
          </p>
          <div className="flex justify-center sm:justify-start gap-8">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#8B9E77] inline-block" />
                <p className="text-xs text-[#9E8E7E]">台股 {twPct.toFixed(1)}%</p>
              </div>
              <p className="text-lg font-semibold text-[#8B9E77]">
                {formatTwd(summary.twValueTwd)}
              </p>
            </div>
            <div className="w-px bg-[#E8E0D4]" />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#6B5344] inline-block" />
                <p className="text-xs text-[#9E8E7E]">美股 {usPct.toFixed(1)}%</p>
              </div>
              <p className="text-lg font-semibold text-[#6B5344]">
                {formatTwd(summary.usValueTwd)}
              </p>
            </div>
          </div>
          {summary.usdTwdRate && summary.rateUpdatedAt && (
            <p className="mt-3 text-xs text-[#B0A090]">
              1 USD = {summary.usdTwdRate.toFixed(2)} TWD・更新於{" "}
              {new Date(summary.rateUpdatedAt).toLocaleTimeString("zh-TW", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
