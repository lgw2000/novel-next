import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  try {
    const threads = await prisma.thread.findMany({
      where: {
        boardId,
        deleted: false,
        published: true,
        title: { contains: query },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ chapters: threads });
  } catch (error) {
    console.error("Failed to fetch chapters:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
