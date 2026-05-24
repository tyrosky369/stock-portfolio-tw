"use client";

import { useRef, useState } from "react";
import { encrypt, decrypt } from "@/lib/crypto";
import Card from "@/components/ui/Card";

type Status = { type: "success" | "error"; message: string } | null;

function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "輸入密碼"}
        className="w-full border border-[#E0D8CC] rounded-xl px-4 py-2.5 pr-20 text-sm text-[#3A3028] bg-[#FAFAF8] focus:outline-none focus:border-[#8B9E77]"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9E8E7E] hover:text-[#6B5344]"
      >
        {show ? "隱藏" : "顯示"}
      </button>
    </div>
  );
}

function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <p
      className={`text-sm rounded-xl px-4 py-2.5 ${
        status.type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-600 border border-red-200"
      }`}
    >
      {status.message}
    </p>
  );
}

// ── 匯出 ──────────────────────────────────────────────────────────────────────
function ExportPanel() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleExport() {
    if (!password) return setStatus({ type: "error", message: "請輸入加密密碼" });
    if (password !== confirm) return setStatus({ type: "error", message: "兩次密碼不一致" });
    if (password.length < 6) return setStatus({ type: "error", message: "密碼至少 6 個字元" });

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("取得資料失敗");
      const data = await res.json();

      if (data.holdings.length === 0) {
        setStatus({ type: "error", message: "目前沒有任何持股資料可備份" });
        return;
      }

      const encrypted = await encrypt(JSON.stringify(data), password);
      const blob = new Blob([encrypted], { type: "application/octet-stream" });
      const filename = `portfolio-${new Date().toISOString().slice(0, 10)}.sptwbak`;

      // File System Access API（可選擇 iCloud 資料夾）
      if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
        // @ts-expect-error - File System Access API
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: "台美股備份檔",
              accept: { "application/octet-stream": [".sptwbak"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        setStatus({ type: "success", message: `備份完成！已儲存為 ${filename}` });
      } else {
        // Fallback：直接下載
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setStatus({ type: "success", message: `備份完成！已下載 ${filename}，請手動移至 iCloud 資料夾` });
      }

      setPassword("");
      setConfirm("");
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return; // 使用者取消
      setStatus({ type: "error", message: e instanceof Error ? e.message : "匯出失敗" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-base font-semibold text-[#3A3028] mb-1">匯出加密備份</h2>
      <p className="text-xs text-[#9E8E7E] mb-5">
        將所有持股資料加密後存成 <code className="bg-[#EDE8E0] px-1 rounded">.sptwbak</code>{" "}
        檔案。可直接儲存到 iCloud Drive 資料夾。
      </p>

      <div className="space-y-3">
        <div>
          <label htmlFor="export-pw" className="text-xs text-[#9E8E7E] mb-1 block">加密密碼</label>
          <PasswordInput id="export-pw" value={password} onChange={setPassword} placeholder="至少 6 個字元" />
        </div>
        <div>
          <label htmlFor="export-confirm" className="text-xs text-[#9E8E7E] mb-1 block">確認密碼</label>
          <PasswordInput id="export-confirm" value={confirm} onChange={setConfirm} placeholder="再輸入一次" />
        </div>

        <StatusBanner status={status} />

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full py-2.5 rounded-full bg-[#8B9E77] text-white text-sm font-medium hover:bg-[#7A8D66] disabled:opacity-50 transition-colors"
        >
          {loading ? "加密中…" : "匯出備份"}
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-[#EDE8E0]">
        <p className="text-xs text-[#B0A090] leading-relaxed">
          🔐 使用 AES-256-GCM 加密，密碼僅在您的裝置處理，不會傳送至伺服器。<br />
          ⚠️ 請妥善保管密碼，遺失後無法解密。
        </p>
      </div>
    </Card>
  );
}

// ── 匯入 ──────────────────────────────────────────────────────────────────────
function ImportPanel() {
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingData = useRef<object | null>(null);

  async function handleFileSelect(f: File) {
    setFile(f);
    setStatus(null);
    setShowConfirm(false);
  }

  async function handleLoad() {
    if (!file) return setStatus({ type: "error", message: "請選擇備份檔案" });
    if (!password) return setStatus({ type: "error", message: "請輸入密碼" });

    setLoading(true);
    setStatus(null);
    try {
      const text = await file.text();
      const decrypted = await decrypt(text, password);
      const data = JSON.parse(decrypted);

      if (!data.holdings || !Array.isArray(data.holdings)) {
        throw new Error("備份檔資料格式不正確");
      }

      pendingData.current = data;
      setShowConfirm(true);
      setStatus(null);
    } catch (e: unknown) {
      setStatus({ type: "error", message: e instanceof Error ? e.message : "載入失敗" });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmImport() {
    if (!pendingData.current) return;
    setLoading(true);
    setShowConfirm(false);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingData.current),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(result.error));
      setStatus({ type: "success", message: `已成功匯入 ${result.imported} 筆持股，請重新整理頁面查看` });
      setFile(null);
      setPassword("");
      pendingData.current = null;
    } catch (e: unknown) {
      setStatus({ type: "error", message: e instanceof Error ? e.message : "匯入失敗" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePickFile() {
    if (typeof window !== "undefined" && "showOpenFilePicker" in window) {
      try {
        // @ts-expect-error - File System Access API
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: "台美股備份檔",
              accept: { "application/octet-stream": [".sptwbak"] },
            },
          ],
          multiple: false,
        });
        const f = await handle.getFile();
        handleFileSelect(f);
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== "AbortError") {
          setStatus({ type: "error", message: "開啟檔案失敗" });
        }
      }
    } else {
      fileRef.current?.click();
    }
  }

  return (
    <Card>
      <h2 className="text-base font-semibold text-[#3A3028] mb-1">載入備份</h2>
      <p className="text-xs text-[#9E8E7E] mb-5">
        選取 <code className="bg-[#EDE8E0] px-1 rounded">.sptwbak</code> 備份檔，輸入密碼後載入。
        <span className="text-red-400 ml-1">現有資料將被取代。</span>
      </p>

      <div className="space-y-3">
        {/* 檔案選取 */}
        <div>
          <label className="text-xs text-[#9E8E7E] mb-1 block">備份檔案</label>
          <button
            onClick={handlePickFile}
            className="w-full border border-dashed border-[#C8B8A2] rounded-xl px-4 py-3 text-sm text-[#6B5344] hover:bg-[#FAF8F4] transition-colors text-left"
          >
            {file ? (
              <span className="font-medium">{file.name}</span>
            ) : (
              <span className="text-[#B0A090]">點擊選取備份檔案…</span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".sptwbak"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>

        {/* 密碼 */}
        <div>
          <label htmlFor="import-pw" className="text-xs text-[#9E8E7E] mb-1 block">解密密碼</label>
          <PasswordInput id="import-pw" value={password} onChange={setPassword} />
        </div>

        <StatusBanner status={status} />

        {/* 確認覆蓋警告 */}
        {showConfirm && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
            <p className="text-sm text-amber-800 font-medium">確認取代現有資料？</p>
            <p className="text-xs text-amber-700">
              目前所有持股將被刪除，並以備份檔內容取代。此操作無法復原。
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirmImport}
                disabled={loading}
                className="px-4 py-1.5 rounded-full bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 disabled:opacity-50"
              >
                確認匯入
              </button>
              <button
                onClick={() => { setShowConfirm(false); pendingData.current = null; }}
                className="px-4 py-1.5 rounded-full border border-[#C8B8A2] text-[#6B5344] text-xs hover:bg-[#F0EBE3]"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {!showConfirm && (
          <button
            onClick={handleLoad}
            disabled={loading || !file}
            className="w-full py-2.5 rounded-full bg-[#6B5344] text-white text-sm font-medium hover:bg-[#5A4333] disabled:opacity-50 transition-colors"
          >
            {loading ? "解密中…" : "載入備份"}
          </button>
        )}
      </div>
    </Card>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export default function BackupPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#3A3028]">備份與還原</h1>
        <p className="text-sm text-[#9E8E7E] mt-0.5">
          加密備份儲存至 iCloud 或任意位置，隨時可還原
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExportPanel />
        <ImportPanel />
      </div>
    </div>
  );
}
