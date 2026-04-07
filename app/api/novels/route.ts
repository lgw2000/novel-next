import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { boardService } from "@/lib/services/board";
import { z } from "zod";

const createNovelSchema = z.object({
  id: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  coverImage: z.string().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createNovelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Check if board ID already exists
    const existing = await prisma.board.findUnique({ where: { id: parsed.data.id } });
    if (existing) {
      return NextResponse.json({ error: "이미 존재하는 고유 ID(Slug)입니다." }, { status: 400 });
    }

    // Create the board using boardService (it handles base permissions)
    // We treat the current user as the author
    const board = await (prisma.board as any).create({
      data: {
        id: parsed.data.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        coverImage: parsed.data.coverImage || null,
        userId: session.user.id,
        defaultUsername: session.user.name || "작가",
      },
    });

    // Handle permissions: In a real system, we'd add the user to a 'Board Owner' role for this board.
    // For now, our BoardService and other services will check Board.userId.

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("Failed to create novel:", error);
    return NextResponse.json({ error: "소설 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
