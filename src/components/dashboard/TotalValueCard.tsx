"use client";

import Card from "@/components/ui/Card";
import { formatTwd } from "@/lib/formatters";
import { PortfolioSummary } from "@/types";

export default function TotalValueCard({ summary }: { summary: PortfolioSummary }) {
  return (
    <Card className="text-center">
      <p className="text-xs text-[#9E8E7E] mb-1 tracking-widest uppercase">總市值</p>
      <p className="text-4xl font-bold text-[#3A3028] mb-4">
        {formatTwd(summary.totalValueTwd)}
      </p>
      <div className="flex justify-center gap-8">
        <div>
          <p className="text-xs text-[#9E8E7E] mb-0.5">台股</p>
          <p className="text-lg font-semibold text-[#8B9E77]">
            {formatTwd(summary.twValueTwd)}
          </p>
        </div>
        <div className="w-px bg-[#E8E0D4]" />
        <div>
          <p className="text-xs text-[#9E8E7E] mb-0.5">美股</p>
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
    </Card>
  );
}
