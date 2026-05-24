import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const holdings = await prisma.stockHolding.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      market: true,
      accountName: true,
      ticker: true,
      stockName: true,
      shares: true,
      avgCost: true,
    },
  });

  return NextResponse.json({
    version: 1,
    exportedAt: new Date().toISOString(),
    holdings: holdings.map((h) => ({
      market: h.market,
      accountName: h.accountName,
      ticker: h.ticker,
      stockName: h.stockName,
      shares: Number(h.shares),
      avgCost: h.avgCost != null ? Number(h.avgCost) : null,
    })),
  });
}
