export type Market = "TW" | "US";

export interface HoldingRow {
  id: string;
  market: Market;
  accountName: string;
  ticker: string;
  stockName: string;
  shares: number;
  avgCost: number | null;
  latestPrice: number | null;      // 原幣
  latestPriceTwd: number | null;   // 換算台幣
  usdTwdRate: number | null;
  currentValueTwd: number | null;
  costTwd: number | null;
  pnlTwd: number | null;
  pnlPct: number | null;
  snapshotAt: string | null;
}

export interface PortfolioSummary {
  totalValueTwd: number;
  twValueTwd: number;
  usValueTwd: number;
  twHoldings: { ticker: string; stockName: string; valueTwd: number }[];
  usHoldings: { ticker: string; stockName: string; valueTwd: number }[];
  usdTwdRate: number | null;
  rateUpdatedAt: string | null;
}

export interface PortfolioSnapshotPoint {
  snapshotAt: string;
  totalValueTwd: number;
  twValueTwd: number;
  usValueTwd: number;
}
