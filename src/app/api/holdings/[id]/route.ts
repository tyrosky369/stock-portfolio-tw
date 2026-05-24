import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  owner: z.string().min(1),
  accountName: z.string().min(1),
  ticker: z.string().min(1).toUpperCase(),
  stockName: z.string().min(1),
  shares: z.number().positive(),
  avgCost: z.number().positive().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.stockHolding.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.stockHolding.update({
    where: { id },
    data: {
      owner: parsed.data.owner,
      accountName: parsed.data.accountName,
      ticker: parsed.data.ticker,
      stockName: parsed.data.stockName,
      shares: parsed.data.shares,
      avgCost: parsed.data.avgCost ?? null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const existing = await prisma.stockHolding.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.stockHolding.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
