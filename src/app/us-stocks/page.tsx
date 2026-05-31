"use client";

import { useCallback, useEffect, useState } from "react";
import HoldingsTable from "@/components/stocks/HoldingsTable";
import AddHoldingForm from "@/components/stocks/AddHoldingForm";
import RefreshPriceButton from "@/components/stocks/RefreshPriceButton";
import Card from "@/components/ui/Card";
import { HoldingRow } from "@/types";
import { formatTwd, formatPercent, pnlColor } from "@/lib/formatters";
import { useMember } from "@/contexts/MemberContext";

export default function UsStocksPage() {
  const { selectedOwner } = useMember();
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usdTwdRate, setUsdTwdRate] = useState<number | null>(null);
  const [rateUpdatedAt, setRateUpdatedAt] = useState<string | null>(null);

  const fetchHoldings = useCallback(async () => {
    setLoading(true);
    const ownerParam = selectedOwner === "全部" ? "" : `&owner=${encodeURIComponent(selectedOwner)}`;
    const res = await fetch(`/api/holdings?market=US${ownerParam}`);
    const data: HoldingRow[] = await res.json();
    setHoldings(data);
    setLoading(false);
    const withRate = data.find((h) => h.usdTwdRate != null);
    if (withRate) {
      setUsdTwdRate(withRate.usdTwdRate);
      setRateUpdatedAt(withRate.snapshotAt);
    }
  }, [selectedOwner]);

  useEffect(() => { fetchHoldings(); }, [fetchHoldings]);

  const totalValue = holdings.reduce((s, h) => s + (h.currentValueTwd ?? 0), 0);
  const hasPnl = holdings.some((h) => h.pnlTwd != null);
  const totalPnlTwd = holdings.reduce((s, h) => s + (h.pnlTwd ?? 0), 0);
  const totalCostTwd = holdings.reduce((s, h) => s + (h.costTwd ?? 0), 0);
  const totalPnlPct = totalCostTwd > 0 ? (totalPnlTwd / totalCostTwd) * 100 : null;
  const showOwner = selectedOwner === "全部";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#3A3028]">
            美股庫存{selectedOwner !== "全部" && <span className="text-[#6B5344] ml-2 text-base">· {selectedOwner}</span>}
          </h1>
          {totalValue > 0 && (
            <p className="text-sm text-[#9E8E7E] mt-0.5">
              現值合計（TWD）：<span className="text-[#6B5344] font-semibold">{formatTwd(totalValue)}</span>
            </p>
          )}
          {hasPnl && (
            <p className="text-sm text-[#9E8E7E] mt-0.5">
              總損益：
              <span className={`font-semibold ${pnlColor(totalPnlTwd)}`}>{formatTwd(totalPnlTwd)}</span>
              {totalPnlPct != null && (
                <span className={`ml-1.5 text-xs font-medium ${pnlColor(totalPnlPct)}`}>
                  ({formatPercent(totalPnlPct)})
                </span>
              )}
            </p>
          )}
          {usdTwdRate && rateUpdatedAt && (
            <p className="text-xs text-[#B0A090] mt-0.5">
              1 USD = {usdTwdRate.toFixed(2)} TWD・更新於{" "}
              {new Date(rateUpdatedAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <RefreshPriceButton market="US" onRefreshed={fetchHoldings} />
      </div>

      <AddHoldingForm market="US" onAdded={fetchHoldings} />

      <Card>
        {loading ? (
          <p className="text-center text-[#9E8E7E] py-8">載入中…</p>
        ) : (
          <HoldingsTable
            holdings={holdings}
            market="US"
            showOwner={showOwner}
            onDeleted={fetchHoldings}
            onUpdated={fetchHoldings}
          />
        )}
      </Card>
    </div>
  );
}
