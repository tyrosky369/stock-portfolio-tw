"use client";

import Card from "@/components/ui/Card";
import { formatTwd } from "@/lib/formatters";

const STOCK_TICKERS = new Set(["VT", "VTI", "VXUS", "0050", "006208", "2330", "00646"]);
const BOND_TICKERS  = new Set(["BND", "00719B", "00751B"]);
const BTC_TICKERS   = new Set(["IBIT"]);
const GOLD_TICKERS  = new Set(["GLD"]);

const CATEGORIES = [
  { key: "股票",   color: "#8B9E77", bg: "#8B9E7722" },
  { key: "債券",   color: "#A08060", bg: "#A0806022" },
  { key: "黃金",   color: "#C8A84B", bg: "#C8A84B22" },
  { key: "比特幣", color: "#B87333", bg: "#B8733322" },
] as const;

type CategoryKey = "股票" | "債券" | "黃金" | "比特幣";

function classify(ticker: string): CategoryKey | null {
  if (STOCK_TICKERS.has(ticker)) return "股票";
  if (BOND_TICKERS.has(ticker))  return "債券";
  if (BTC_TICKERS.has(ticker))   return "比特幣";
  if (GOLD_TICKERS.has(ticker))  return "黃金";
  return null;
}

interface Holding {
  ticker: string;
  stockName: string;
  valueTwd: number;
}

interface Props {
  twHoldings: Holding[];
  usHoldings: Holding[];
}

export default function AssetClassPieChart({ twHoldings, usHoldings }: Props) {
  const totals: Record<CategoryKey, number> = { 股票: 0, 債券: 0, 黃金: 0, 比特幣: 0 };

  for (const h of [...twHoldings, ...usHoldings]) {
    const cat = classify(h.ticker);
    if (cat) totals[cat] += h.valueTwd;
  }

  const total = Object.values(totals).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const rows = CATEGORIES
    .map((c) => ({ ...c, value: totals[c.key], pct: totals[c.key] / total }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <Card>
      <p className="text-sm font-semibold text-[#6B5344] mb-1">資產類別分布</p>
      <p className="text-xs text-[#B0A090] mb-5">合計 {formatTwd(total)}</p>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.key}>
            {/* 標籤列 */}
            <div className="flex justify-between items-baseline mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: row.color }}
                />
                <span className="text-sm font-medium text-[#3A3028]">{row.key}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-bold text-[#3A3028]">
                  {(row.pct * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-[#9E8E7E] tabular-nums">
                  {formatTwd(row.value)}
                </span>
              </div>
            </div>

            {/* 條形 */}
            <div className="w-full h-3 rounded-full" style={{ backgroundColor: row.bg }}>
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(row.pct * 100).toFixed(2)}%`,
                  backgroundColor: row.color,
                  minWidth: row.value > 0 ? "6px" : "0",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
