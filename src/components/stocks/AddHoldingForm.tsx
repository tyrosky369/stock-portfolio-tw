"use client";

import { useState } from "react";

interface Props {
  market: "TW" | "US";
  onAdded: () => void;
}

const empty = {
  accountName: "",
  ticker: "",
  stockName: "",
  shares: "",
  avgCost: "",
};

export default function AddHoldingForm({ market, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market,
          accountName: form.accountName,
          ticker: form.ticker.toUpperCase(),
          stockName: form.stockName,
          shares: Number(form.shares),
          avgCost: form.avgCost ? Number(form.avgCost) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.error));
      setForm(empty);
      setOpen(false);
      onAdded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "新增失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-5 py-2 rounded-full border border-[#8B9E77] text-[#8B9E77] text-sm font-medium hover:bg-[#F0F4EC] transition-colors"
      >
        {open ? "取消" : "+ 新增持股"}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 bg-white border border-[#E8E0D4] rounded-2xl p-5 grid grid-cols-2 gap-3 md:grid-cols-3"
        >
          {[
            { label: "銀行帳戶", field: "accountName", placeholder: "永豐", type: "text" },
            { label: `股票代號${market === "TW" ? "（不含 .TW）" : ""}`, field: "ticker", placeholder: market === "TW" ? "2330" : "AAPL", type: "text" },
            { label: "股票名稱", field: "stockName", placeholder: market === "TW" ? "台積電" : "Apple", type: "text" },
            { label: "持股股數", field: "shares", placeholder: "100", type: "number" },
            { label: `平均成本（${market === "TW" ? "TWD" : "USD"}，選填）`, field: "avgCost", placeholder: "500", type: "number" },
          ].map(({ label, field, placeholder, type }) => (
            <label key={field} className="flex flex-col gap-1">
              <span className="text-xs text-[#9E8E7E]">{label}</span>
              <input
                type={type}
                step="any"
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={(e) => update(field, e.target.value)}
                required={field !== "avgCost"}
                className="border border-[#E0D8CC] rounded-lg px-3 py-1.5 text-sm text-[#3A3028] bg-[#FAFAF8] focus:outline-none focus:border-[#8B9E77]"
              />
            </label>
          ))}

          <div className="col-span-2 md:col-span-3 flex items-center gap-3 mt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-[#6B5344] text-white text-sm font-medium disabled:opacity-50 hover:bg-[#5A4333] transition-colors"
            >
              {loading ? "儲存中…" : "儲存"}
            </button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        </form>
      )}
    </div>
  );
}
