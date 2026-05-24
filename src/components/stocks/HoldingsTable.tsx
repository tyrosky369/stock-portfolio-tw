"use client";

import { useState } from "react";
import { HoldingRow } from "@/types";
import { formatTwd, formatPercent, pnlColor } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";
import { useMember } from "@/contexts/MemberContext";

interface Props {
  holdings: HoldingRow[];
  market: "TW" | "US";
  showOwner?: boolean;
  onDeleted: () => void;
  onUpdated: () => void;
}

interface EditForm {
  owner: string;
  accountName: string;
  ticker: string;
  stockName: string;
  shares: string;
  avgCost: string;
}

function toEditForm(h: HoldingRow): EditForm {
  return {
    owner: h.owner,
    accountName: h.accountName,
    ticker: h.ticker,
    stockName: h.stockName,
    shares: String(h.shares),
    avgCost: h.avgCost != null ? String(h.avgCost) : "",
  };
}

export default function HoldingsTable({ holdings, market, showOwner = false, onDeleted, onUpdated }: Props) {
  const { members } = useMember();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  function startEdit(h: HoldingRow) {
    setEditingId(h.id);
    setEditForm(toEditForm(h));
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setEditError(null);
  }

  function updateField(field: keyof EditForm, value: string) {
    setEditForm((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  async function handleSave(id: string) {
    if (!editForm) return;
    setSavingId(id);
    setEditError(null);
    try {
      const res = await fetch(`/api/holdings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: editForm.owner.trim() || "我",
          accountName: editForm.accountName,
          ticker: editForm.ticker.toUpperCase(),
          stockName: editForm.stockName,
          shares: Number(editForm.shares),
          avgCost: editForm.avgCost ? Number(editForm.avgCost) : null,
        }),
      });
      if (!res.ok) throw new Error("儲存失敗");
      setEditingId(null);
      setEditForm(null);
      onUpdated();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setSavingId(null);
    }
  }

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

  const costLabel = market === "TW" ? "TWD" : "USD";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-[#3A3028]">
        <thead>
          <tr className="border-b border-[#E8E0D4] text-xs text-[#9E8E7E]">
            {showOwner && <th className="py-2 pr-3 text-left font-medium">成員</th>}
            <th className="py-2 pr-3 text-left font-medium">帳戶</th>
            <th className="py-2 pr-3 text-left font-medium">代號</th>
            <th className="py-2 pr-3 text-left font-medium">名稱</th>
            <th className="py-2 pr-3 text-right font-medium">股數</th>
            <th className="py-2 pr-3 text-right font-medium">成本（{costLabel}）</th>
            <th className="py-2 pr-3 text-right font-medium">現價（{costLabel}）</th>
            <th className="py-2 pr-3 text-right font-medium">現值（TWD）</th>
            <th className="py-2 pr-3 text-right font-medium">損益</th>
            <th className="py-2 text-right font-medium">損益率</th>
            <th className="py-2 pl-4" />
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const isEditing = editingId === h.id;

            if (isEditing && editForm) {
              return (
                <tr key={h.id} className="border-b border-[#E8D8C8] bg-[#FDF8F3]">
                  {showOwner && (
                    <td className="py-2 pr-3">
                      <input
                        list="edit-members-list"
                        value={editForm.owner}
                        onChange={(e) => updateField("owner", e.target.value)}
                        className="w-16 border border-[#C8B8A2] rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#8B9E77]"
                      />
                      <datalist id="edit-members-list">
                        {members.map((m) => <option key={m} value={m} />)}
                      </datalist>
                    </td>
                  )}
                  <td className="py-2 pr-3">
                    <input value={editForm.accountName} onChange={(e) => updateField("accountName", e.target.value)}
                      className="w-full border border-[#C8B8A2] rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#8B9E77]" />
                  </td>
                  <td className="py-2 pr-3">
                    <input value={editForm.ticker} onChange={(e) => updateField("ticker", e.target.value)}
                      className="w-full border border-[#C8B8A2] rounded-lg px-2 py-1 text-xs font-mono bg-white focus:outline-none focus:border-[#8B9E77] uppercase" />
                  </td>
                  <td className="py-2 pr-3">
                    <input value={editForm.stockName} onChange={(e) => updateField("stockName", e.target.value)}
                      className="w-full border border-[#C8B8A2] rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#8B9E77]" />
                  </td>
                  <td className="py-2 pr-3">
                    <input type="number" step="any" value={editForm.shares} onChange={(e) => updateField("shares", e.target.value)}
                      className="w-20 border border-[#C8B8A2] rounded-lg px-2 py-1 text-xs text-right bg-white focus:outline-none focus:border-[#8B9E77]" />
                  </td>
                  <td className="py-2 pr-3">
                    <input type="number" step="any" placeholder="選填" value={editForm.avgCost} onChange={(e) => updateField("avgCost", e.target.value)}
                      className="w-24 border border-[#C8B8A2] rounded-lg px-2 py-1 text-xs text-right bg-white focus:outline-none focus:border-[#8B9E77]" />
                  </td>
                  <td className="py-2 pr-3 text-right text-[#B0A090] text-xs">
                    {h.latestPrice != null ? h.latestPrice.toLocaleString("zh-TW", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                  </td>
                  <td className="py-2 pr-3 text-right text-[#B0A090] text-xs">
                    {h.currentValueTwd != null ? formatTwd(h.currentValueTwd) : "—"}
                  </td>
                  <td className="py-2 pr-3 text-right text-[#B0A090] text-xs">—</td>
                  <td className="py-2 text-right text-[#B0A090] text-xs">—</td>
                  <td className="py-2 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editError && <span className="text-xs text-red-500">{editError}</span>}
                      <button onClick={() => handleSave(h.id)} disabled={savingId === h.id}
                        className="text-xs px-3 py-1 rounded-full bg-[#8B9E77] text-white hover:bg-[#7A8D66] disabled:opacity-40 transition-colors">
                        {savingId === h.id ? "儲存…" : "儲存"}
                      </button>
                      <button onClick={cancelEdit}
                        className="text-xs px-3 py-1 rounded-full border border-[#C8B8A2] text-[#6B5344] hover:bg-[#F0EBE3] transition-colors">
                        取消
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={h.id} className="border-b border-[#F0EBE3] hover:bg-[#FAF8F4]">
                {showOwner && (
                  <td className="py-3 pr-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[#EDE8E0] text-[#6B5344]">{h.owner}</span>
                  </td>
                )}
                <td className="py-3 pr-3">{h.accountName}</td>
                <td className="py-3 pr-3 font-mono font-semibold">{h.ticker}</td>
                <td className="py-3 pr-3">{h.stockName}</td>
                <td className="py-3 pr-3 text-right">{Number(h.shares).toLocaleString()}</td>
                <td className="py-3 pr-3 text-right text-[#9E8E7E]">
                  {h.avgCost != null ? h.avgCost.toLocaleString("zh-TW", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : <span className="text-[#C0B8B0]">—</span>}
                </td>
                <td className="py-3 pr-3 text-right">
                  {h.latestPrice != null ? h.latestPrice.toLocaleString("zh-TW", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : <span className="text-[#C0B8B0]">—</span>}
                </td>
                <td className="py-3 pr-3 text-right font-medium">
                  {h.currentValueTwd != null ? formatTwd(h.currentValueTwd) : <span className="text-[#C0B8B0]">—</span>}
                </td>
                <td className={`py-3 pr-3 text-right font-medium ${h.pnlTwd != null ? pnlColor(h.pnlTwd) : ""}`}>
                  {h.pnlTwd != null ? formatTwd(h.pnlTwd) : <span className="text-[#C0B8B0]">—</span>}
                </td>
                <td className="py-3 text-right">
                  {h.pnlPct != null ? (
                    <Badge variant={h.pnlPct >= 0 ? "green" : "red"}>{formatPercent(h.pnlPct)}</Badge>
                  ) : <span className="text-[#C0B8B0]">—</span>}
                </td>
                <td className="py-3 pl-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => startEdit(h)} className="text-xs text-[#8B9E77] hover:text-[#6B8A5E] transition-colors">編輯</button>
                    <button onClick={() => handleDelete(h.id)} disabled={deletingId === h.id}
                      className="text-xs text-[#C0A090] hover:text-red-500 transition-colors disabled:opacity-40">刪除</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
