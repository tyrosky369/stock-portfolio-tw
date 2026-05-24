import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fetchTwPrice, fetchPrice, fetchUsdTwdRate } from "@/lib/yahoo";
import { Market } from "@prisma/client";

const RefreshSchema = z.object({
  market: z.enum(["TW", "US"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = RefreshSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { market } = parsed.data;

  const holdings = await prisma.stockHolding.findMany({
    where: { market: market as Market },
  });

  if (holdings.length === 0) {
    return NextResponse.json({ message: "No holdings to update" });
  }

  let usdTwdRate: number | null = null;
  if (market === "US") {
    usdTwdRate = await fetchUsdTwdRate();
  }

  const snapshots = await Promise.allSettled(
    holdings.map(async (h) => {
      const priceLocal = market === "TW"
        ? await fetchTwPrice(h.ticker)
        : await fetchPrice(h.ticker);
      const priceTwd =
        market === "TW" ? priceLocal : priceLocal * usdTwdRate!;

      return prisma.priceSnapshot.create({
        data: {
          ticker: h.ticker,
          market: market as Market,
          priceLocal,
          priceTwd,
          usdTwdRate: usdTwdRate,
          holdingId: h.id,
        },
      });
    })
  );

  const failed = snapshots.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error("Some price fetches failed:", failed);
  }

  // Aggregate total portfolio value for trend snapshot
  const allHoldings = await prisma.stockHolding.findMany({
    include: {
      priceSnapshots: { orderBy: { snapshotAt: "desc" }, take: 1 },
    },
  });

  let twValueTwd = 0;
  let usValueTwd = 0;

  for (const h of allHoldings) {
    const snap = h.priceSnapshots[0];
    if (!snap) continue;
    const val = Number(h.shares) * Number(snap.priceTwd);
    if (h.market === "TW") twValueTwd += val;
    else usValueTwd += val;
  }

  await prisma.portfolioSnapshot.create({
    data: {
      totalValueTwd: twValueTwd + usValueTwd,
      twValueTwd,
      usValueTwd,
    },
  });

  return NextResponse.json({
    updated: snapshots.filter((r) => r.status === "fulfilled").length,
    failed: failed.length,
    usdTwdRate,
  });
}
