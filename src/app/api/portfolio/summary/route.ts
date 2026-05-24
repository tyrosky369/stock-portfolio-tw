import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MemberSummary } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner");
  const filterAll = !owner || owner === "全部";

  const where = filterAll ? {} : { owner };

  const holdings = await prisma.stockHolding.findMany({
    where,
    include: {
      priceSnapshots: { orderBy: { snapshotAt: "desc" }, take: 1 },
    },
  });

  let twValueTwd = 0;
  let usValueTwd = 0;
  let usdTwdRate: number | null = null;
  let rateUpdatedAt: string | null = null;

  const twMap = new Map<string, { ticker: string; stockName: string; valueTwd: number }>();
  const usMap = new Map<string, { ticker: string; stockName: string; valueTwd: number }>();
  const memberMap = new Map<string, MemberSummary>();

  for (const h of holdings) {
    const snap = h.priceSnapshots[0];
    if (!snap) continue;
    const val = Number(h.shares) * Number(snap.priceTwd);

    // 成員累計
    if (filterAll) {
      const m = memberMap.get(h.owner) ?? { owner: h.owner, totalValueTwd: 0, twValueTwd: 0, usValueTwd: 0 };
      m.totalValueTwd += val;
      if (h.market === "TW") m.twValueTwd += val; else m.usValueTwd += val;
      memberMap.set(h.owner, m);
    }

    if (h.market === "TW") {
      twValueTwd += val;
      const ex = twMap.get(h.ticker);
      if (ex) ex.valueTwd += val;
      else twMap.set(h.ticker, { ticker: h.ticker, stockName: h.stockName, valueTwd: val });
    } else {
      usValueTwd += val;
      const ex = usMap.get(h.ticker);
      if (ex) ex.valueTwd += val;
      else usMap.set(h.ticker, { ticker: h.ticker, stockName: h.stockName, valueTwd: val });
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
    twHoldings: Array.from(twMap.values()),
    usHoldings: Array.from(usMap.values()),
    usdTwdRate,
    rateUpdatedAt,
    memberSummaries: Array.from(memberMap.values()),
  });
}
