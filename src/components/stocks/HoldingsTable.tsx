"use client";

import { useState } from "react";
import { HoldingRow } from "@/types";
import { formatTwd, formatPercent, pnlColor } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";

interface Props {
  holdings: HoldingRow[];
  market: "TW" | "US";
  onDeleted: () => void;
}

export default function HoldingsTable({ holdings, market, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/holdings/${id}`, { method: "DELETE" });
    setDeletingId(null);
    onDeleted();
  }

  if (holdings.length === 0) {
    return (
      <p className="text-center text-[#B0A090] text-sm py-12">
        尚無持股，請點擊「+ 新增持股」
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-[#3A3028]">
        <thead>
          <tr className="border-b border-[#E8E0D4] text-xs text-[#9E8E7E]">
            <th className="py-2 pr-4 text-left font-medium">帳戶</th>
            <th className="py-2 pr-4 text-left font-medium">代號</th>
            <th className="py-2 pr-4 text-left font-medium">名稱</th>
            <th className="py-2 pr-4 text-right font-medium">股數</th>
            <th className="py-2 pr-4 text-right font-medium">
              現價（{market === "TW" ? "TWD" : "USD"}）
            </th>
            <th className="py-2 pr-4 text-right font-medium">現值（TWD）</th>
            <th className="py-2 pr-4 text-right font-medium">損益</th>
            <th className="py-2 text-right font-medium">損益率</th>
            <th className="py-2 pl-4" />
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.id} className="border-b border-[#F0EBE3] hover:bg-[#FAF8F4]">
              <td className="py-3 pr-4">{h.accountName}</td>
              <td className="py-3 pr-4 font-mono font-semibold">{h.ticker}</td>
              <td className="py-3 pr-4">{h.stockName}</td>
              <td className="py-3 pr-4 text-right">{Number(h.shares).toLocaleString()}</td>
              <td className="py-3 pr-4 text-right">
                {h.latestPrice != null
                  ? h.latestPrice.toLocaleString("zh-TW", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : <span className="text-[#C0B8B0]">—</span>}
              </td>
              <td className="py-3 pr-4 text-right font-medium">
                {h.currentValueTwd != null ? formatTwd(h.currentValueTwd) : <span className="text-[#C0B8B0]">—</span>}
              </td>
              <td className={`py-3 pr-4 text-right font-medium ${h.pnlTwd != null ? pnlColor(h.pnlTwd) : ""}`}>
                {h.pnlTwd != null ? formatTwd(h.pnlTwd) : <span className="text-[#C0B8B0]">—</span>}
              </td>
              <td className="py-3 text-right">
                {h.pnlPct != null ? (
                  <Badge variant={h.pnlPct >= 0 ? "green" : "red"}>
                    {formatPercent(h.pnlPct)}
                  </Badge>
                ) : (
                  <span className="text-[#C0B8B0]">—</span>
                )}
              </td>
              <td className="py-3 pl-4 text-right">
                <button
                  onClick={() => handleDelete(h.id)}
                  disabled={deletingId === h.id}
                  className="text-xs text-[#C0A090] hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
