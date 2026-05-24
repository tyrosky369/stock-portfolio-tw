"use client";

import { useRef, useState } from "react";
import { useMember } from "@/contexts/MemberContext";

export default function MemberBar() {
  const { selectedOwner, setSelectedOwner, members, refreshMembers } = useMember();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tabs = ["全部", ...members];

  async function handleAdd() {
    const name = newName.trim();
    if (!name) { setAdding(false); setNewName(""); return; }
    if (members.includes(name)) {
      setSelectedOwner(name);
      setAdding(false); setNewName(""); return;
    }
    setSaving(true);
    await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await refreshMembers();
    setSelectedOwner(name);
    setSaving(false);
    setAdding(false);
    setNewName("");
  }

  async function handleDelete(name: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`刪除成員「${name}」？（持股資料不會一併刪除）`)) return;
    await fetch(`/api/members?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    if (selectedOwner === name) setSelectedOwner("全部");
    await refreshMembers();
  }

  return (
    <div className="border-b border-[#E0D8CC] bg-[#F5F0E8]">
      <div className="max-w-6xl mx-auto px-4 h-10 flex items-center gap-1 overflow-x-auto">
        <span className="text-xs text-[#B0A090] mr-1 shrink-0">成員</span>

        {tabs.map((t) => (
          <div key={t} className="relative group shrink-0">
            <button
              onClick={() => setSelectedOwner(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedOwner === t
                  ? "bg-[#6B5344] text-white"
                  : "text-[#6B5344] hover:bg-[#EDE8E0]"
              }`}
            >
              {t}
            </button>
            {/* 刪除按鈕（hover 時出現，全部 tab 不顯示） */}
            {t !== "全部" && (
              <button
                onClick={(e) => handleDelete(t, e)}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#C0A090] text-white text-[8px] items-center justify-center hidden group-hover:flex hover:bg-red-400 transition-colors"
                title={`刪除 ${t}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* 新增成員 */}
        {adding ? (
          <div className="flex items-center gap-1 shrink-0">
            <input
              ref={inputRef}
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAdding(false); setNewName(""); }
              }}
              placeholder="成員名稱"
              disabled={saving}
              className="w-20 px-2 py-0.5 text-xs border border-[#C8B8A2] rounded-lg bg-white focus:outline-none focus:border-[#6B5344]"
            />
            <button onClick={handleAdd} disabled={saving} className="text-xs text-[#8B9E77] hover:text-[#6B8A5E] disabled:opacity-50">
              {saving ? "…" : "確認"}
            </button>
            <button onClick={() => { setAdding(false); setNewName(""); }} className="text-xs text-[#B0A090]">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="shrink-0 px-2 py-0.5 rounded-full text-xs text-[#9E8E7E] hover:bg-[#EDE8E0] transition-colors"
          >
            + 新增成員
          </button>
        )}
      </div>
    </div>
  );
}
