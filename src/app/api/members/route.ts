import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — 回傳所有成員（按 sortOrder 排序）
export async function GET() {
  const members = await prisma.member.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { name: true },
  });
  return NextResponse.json(members.map((m) => m.name));
}

// POST — 新增成員
const AddSchema = z.object({ name: z.string().min(1).max(20) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = AddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.member.count();
  const member = await prisma.member.upsert({
    where: { name: parsed.data.name },
    update: {},
    create: { name: parsed.data.name, sortOrder: count },
  });

  return NextResponse.json(member, { status: 201 });
}

// DELETE — 刪除成員（名稱由 query param 傳入）
export async function DELETE(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  await prisma.member.deleteMany({ where: { name } });
  return NextResponse.json({ success: true });
}
