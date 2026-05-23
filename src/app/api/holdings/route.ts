import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Market } from "@prisma/client";

const CreateSchema = z.object({
  market: z.enum(["TW", "US"]),
  accountName: z.string().min(1),
  ticker: z.string().min(1).toUpperCase(),
  stockName: z.string().min(1),
  shares: z.number().positive(),
  avgCost: z.number().positive().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get("market") as Market | null;

  const holdings = await prisma.stockHolding.findMany({
    where: market ? { market } : undefined,
    orderBy: { createdAt: "asc" },
    include: {
      priceSnapshots: {
        orderBy: { snapshotAt: "desc" },
        take: 1,
      },
    },
  });

  const rows = holdings.map((h) => {
    const snap = h.priceSnapshots[0] ?? null;
    const shares = Number(h.shares);
    const avgCost = h.avgCost ? Number(h.avgCost) : null;
    const priceTwd = snap ? Number(snap.priceTwd) : null;
    const priceLocal = snap ? Number(snap.priceLocal) : null;
    const usdTwdRate = snap?.usdTwdRate ? Number(snap.usdTwdRate) : null;
    const currentValueTwd = priceTwd ? shares * priceTwd : null;

    let costTwd: number | null = null;
    let pnlTwd: number | null = null;
    let pnlPct: number | null = null;

    if (avgCost !== null && currentValueTwd !== null) {
      if (h.market === "TW") {
        costTwd = avgCost * shares;
      } else if (usdTwdRate !== null) {
        costTwd = avgCost * shares * usdTwdRate;
      }
      if (costTwd !== null) {
        pnlTwd = currentValueTwd - costTwd;
        pnlPct = (pnlTwd / costTwd) * 100;
      }
    }

    return {
      id: h.id,
      market: h.market,
      accountName: h.accountName,
      ticker: h.ticker,
      stockName: h.stockName,
      shares,
      avgCost,
      latestPrice: priceLocal,
      latestPriceTwd: priceTwd,
      usdTwdRate,
      currentValueTwd,
      costTwd,
      pnlTwd,
      pnlPct,
      snapshotAt: snap?.snapshotAt.toISOString() ?? null,
    };
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { market, accountName, ticker, stockName, shares, avgCost } = parsed.data;

  const holding = await prisma.stockHolding.create({
    data: {
      market: market as Market,
      accountName,
      ticker,
      stockName,
      shares,
      avgCost: avgCost ?? null,
    },
  });

  return NextResponse.json(holding, { status: 201 });
}
