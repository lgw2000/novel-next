import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ novels: [] });
  }

  const novels: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, name, description, coverImage 
    FROM Board 
    WHERE deleted = 0 
      AND (name LIKE ? OR description LIKE ?)
    ORDER BY updatedAt DESC
    LIMIT 10
  `, `%${query}%`, `%${query}%`);

  return NextResponse.json({ novels });
}
