"use client";

import { useCallback, useEffect, useState } from "react";
import HoldingsTable from "@/components/stocks/HoldingsTable";
import AddHoldingForm from "@/components/stocks/AddHoldingForm";
import RefreshPriceButton from "@/components/stocks/RefreshPriceButton";
import Card from "@/components/ui/Card";
import { HoldingRow } from "@/types";
import { formatTwd } from "@/lib/formatters";

export default function TwStocksPage() {
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHoldings = useCallback(async () => {
    const res = await fetch("/api/holdings?market=TW");
    setHoldings(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const totalValue = holdings.reduce((s, h) => s + (h.currentValueTwd ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#3A3028]">台股庫存</h1>
          {totalValue > 0 && (
            <p className="text-sm text-[#9E8E7E] mt-0.5">
              現值合計：<span className="text-[#8B9E77] font-semibold">{formatTwd(totalValue)}</span>
            </p>
          )}
        </div>
        <RefreshPriceButton market="TW" onRefreshed={fetchHoldings} />
      </div>

      <AddHoldingForm market="TW" onAdded={fetchHoldings} />

      <Card>
        {loading ? (
          <p className="text-center text-[#9E8E7E] py-8">載入中…</p>
        ) : (
          <HoldingsTable holdings={holdings} market="TW" onDeleted={fetchHoldings} />
        )}
      </Card>
    </div>
  );
}
