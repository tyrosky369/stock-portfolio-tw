"use client";

import { useState } from "react";

interface Props {
  market: "TW" | "US";
  onRefreshed: () => void;
}

export default function RefreshPriceButton({ market, onRefreshed }: Props) {
  const [loading, setLoading] = useState(false);
  const [lastMsg, setLastMsg] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setLastMsg(null);
    try {
      const res = await fetch("/api/prices/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "更新失敗");
      setLastMsg(`已更新 ${data.updated} 筆${data.failed ? `，${data.failed} 筆失敗` : ""}`);
      onRefreshed();
    } catch (e: unknown) {
      setLastMsg(e instanceof Error ? e.message : "更新失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="px-5 py-2 rounded-full bg-[#8B9E77] text-white text-sm font-medium disabled:opacity-50 hover:bg-[#7A8D66] transition-colors"
      >
        {loading ? "更新中…" : "更新現價"}
      </button>
      {lastMsg && <span className="text-xs text-[#9E8E7E]">{lastMsg}</span>}
    </div>
  );
}
