"use client";

import { useCallback, useEffect, useState } from "react";
import TotalValueCard from "@/components/dashboard/TotalValueCard";
import PieChartTW from "@/components/dashboard/PieChartTW";
import PieChartUS from "@/components/dashboard/PieChartUS";
import AssetClassPieChart from "@/components/dashboard/AssetClassPieChart";
import TrendLineChart from "@/components/dashboard/TrendLineChart";
import MemberSummaryRow from "@/components/dashboard/MemberSummaryRow";
import { PortfolioSummary, PortfolioSnapshotPoint } from "@/types";
import { useMember } from "@/contexts/MemberContext";

export default function DashboardPage() {
  const { selectedOwner } = useMember();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshotPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const ownerParam = selectedOwner === "全部" ? "" : `&owner=${encodeURIComponent(selectedOwner)}`;
    const [sumRes, snapRes] = await Promise.all([
      fetch(`/api/portfolio/summary?${ownerParam}`),
      fetch("/api/portfolio/snapshots"),
    ]);
    setSummary(await sumRes.json());
    setSnapshots(await snapRes.json());
    setLoading(false);
  }, [selectedOwner]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-[#9E8E7E]">載入中…</div>;
  }
  if (!summary) return null;

  const showAllMembers = selectedOwner === "全部" && summary.memberSummaries.length > 1;

  return (
    <div className="space-y-6">
      <TotalValueCard summary={summary} />

      {showAllMembers && (
        <div>
          <p className="text-xs text-[#9E8E7E] mb-3 ml-1">點擊卡片切換成員</p>
          <MemberSummaryRow summaries={summary.memberSummaries} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PieChartTW holdings={summary.twHoldings} />
        <PieChartUS holdings={summary.usHoldings} />
      </div>

      <AssetClassPieChart
        twHoldings={summary.twHoldings}
        usHoldings={summary.usHoldings}
      />

      <TrendLineChart snapshots={snapshots} />
    </div>
  );
}
