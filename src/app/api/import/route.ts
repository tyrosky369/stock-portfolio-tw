import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Market } from "@prisma/client";

export const dynamic = "force-dynamic";

const HoldingSchema = z.object({
  market: z.enum(["TW", "US"]),
  accountName: z.string().min(1),
  ticker: z.string().min(1),
  stockName: z.string().min(1),
  shares: z.number().positive(),
  avgCost: z.number().positive().nullable().optional(),
});

const ImportSchema = z.object({
  version: z.number(),
  holdings: z.array(HoldingSchema),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { holdings } = parsed.data;

  // 交易：清除現有持股 → 匯入新持股
  await prisma.$transaction([
    prisma.stockHolding.deleteMany(),
    ...holdings.map((h) =>
      prisma.stockHolding.create({
        data: {
          market: h.market as Market,
          accountName: h.accountName,
          ticker: h.ticker,
          stockName: h.stockName,
          shares: h.shares,
          avgCost: h.avgCost ?? null,
        },
      })
    ),
  ]);

  return NextResponse.json({ imported: holdings.length });
}
