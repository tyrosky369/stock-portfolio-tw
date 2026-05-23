"use client";

import { useCallback, useEffect, useState } from "react";
import TotalValueCard from "@/components/dashboard/TotalValueCard";
import PieChartTW from "@/components/dashboard/PieChartTW";
import PieChartUS from "@/components/dashboard/PieChartUS";
import TrendLineChart from "@/components/dashboard/TrendLineChart";
import { PortfolioSummary, PortfolioSnapshotPoint } from "@/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshotPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [sumRes, snapRes] = await Promise.all([
      fetch("/api/portfolio/summary"),
      fetch("/api/portfolio/snapshots"),
    ]);
    setSummary(await sumRes.json());
    setSnapshots(await snapRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#9E8E7E]">
        載入中…
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <TotalValueCard summary={summary} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PieChartTW holdings={summary.twHoldings} />
        <PieChartUS holdings={summary.usHoldings} />
      </div>
      <TrendLineChart snapshots={snapshots} />
    </div>
  );
}
