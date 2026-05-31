export type Market = "TW" | "US";

export interface HoldingRow {
  id: string;
  owner: string;
  market: Market;
  accountName: string;
  ticker: string;
  stockName: string;
  shares: number;
  avgCost: number | null;
  latestPrice: number | null;
  latestPriceTwd: number | null;
  usdTwdRate: number | null;
  currentValueTwd: number | null;
  costTwd: number | null;
  pnlTwd: number | null;
  pnlPct: number | null;
  snapshotAt: string | null;
}

export interface MemberSummary {
  owner: string;
  totalValueTwd: number;
  twValueTwd: number;
  usValueTwd: number;
  pnlTwd: number | null;
}

export interface PortfolioSummary {
  totalValueTwd: number;
  twValueTwd: number;
  usValueTwd: number;
  twHoldings: { ticker: string; stockName: string; valueTwd: number }[];
  usHoldings: { ticker: string; stockName: string; valueTwd: number }[];
  usdTwdRate: number | null;
  rateUpdatedAt: string | null;
  memberSummaries: MemberSummary[];
}

export interface PortfolioSnapshotPoint {
  snapshotAt: string;
  totalValueTwd: number;
  twValueTwd: number;
  usValueTwd: number;
}
