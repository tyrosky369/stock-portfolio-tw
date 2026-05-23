import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const holdings = await prisma.stockHolding.findMany({
    include: {
      priceSnapshots: { orderBy: { snapshotAt: "desc" }, take: 1 },
    },
  });

  let twValueTwd = 0;
  let usValueTwd = 0;
  let usdTwdRate: number | null = null;
  let rateUpdatedAt: string | null = null;

  const twHoldings: { ticker: string; stockName: string; valueTwd: number }[] = [];
  const usHoldings: { ticker: string; stockName: string; valueTwd: number }[] = [];

  for (const h of holdings) {
    const snap = h.priceSnapshots[0];
    if (!snap) continue;
    const val = Number(h.shares) * Number(snap.priceTwd);

    if (h.market === "TW") {
      twValueTwd += val;
      twHoldings.push({ ticker: h.ticker, stockName: h.stockName, valueTwd: val });
    } else {
      usValueTwd += val;
      usHoldings.push({ ticker: h.ticker, stockName: h.stockName, valueTwd: val });
      if (!usdTwdRate && snap.usdTwdRate) {
        usdTwdRate = Number(snap.usdTwdRate);
        rateUpdatedAt = snap.snapshotAt.toISOString();
      }
    }
  }

  return NextResponse.json({
    totalValueTwd: twValueTwd + usValueTwd,
    twValueTwd,
    usValueTwd,
    twHoldings,
    usHoldings,
    usdTwdRate,
    rateUpdatedAt,
  });
}
