import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const snapshots = await prisma.portfolioSnapshot.findMany({
    orderBy: { snapshotAt: "asc" },
    take: 90,
  });

  return NextResponse.json(
    snapshots.map((s) => ({
      snapshotAt: s.snapshotAt.toISOString(),
      totalValueTwd: Number(s.totalValueTwd),
      twValueTwd: Number(s.twValueTwd),
      usValueTwd: Number(s.usValueTwd),
    }))
  );
}
