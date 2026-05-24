import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Market } from "@prisma/client";

const CreateSchema = z.object({
  market: z.enum(["TW", "US"]),
  owner: z.string().min(1).default("我"),
  accountName: z.string().min(1),
  ticker: z.string().min(1).toUpperCase(),
  stockName: z.string().min(1),
  shares: z.number().positive(),
  avgCost: z.number().positive().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get("market") as Market | null;
  const owner = req.nextUrl.searchParams.get("owner");

  const where: Record<string, unknown> = {};
  if (market) where.market = market;
  if (owner && owner !== "全部") where.owner = owner;

  const holdings = await prisma.stockHolding.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: {
      priceSnapshots: { orderBy: { snapshotAt: "desc" }, take: 1 },
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
      owner: h.owner,
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

  const { market, owner, accountName, ticker, stockName, shares, avgCost } = parsed.data;

  // 若成員不在 members 表，自動新增
  const count = await prisma.member.count();
  await prisma.member.upsert({
    where: { name: owner },
    update: {},
    create: { name: owner, sortOrder: count },
  });

  const holding = await prisma.stockHolding.create({
    data: {
      market: market as Market,
      owner,
      accountName,
      ticker,
      stockName,
      shares,
      avgCost: avgCost ?? null,
    },
  });

  return NextResponse.json(holding, { status: 201 });
}
