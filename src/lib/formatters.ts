export function formatTwd(value: number): string {
  return `NT$${Math.round(value).toLocaleString("zh-TW")}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function pnlColor(value: number): string {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-500";
  return "text-gray-500";
}
