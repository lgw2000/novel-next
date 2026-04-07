import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { boardService } from "@/lib/services/board";
import { z } from "zod";

const updateNovelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  newId: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateNovelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { newId, ...updateData } = parsed.data;

    // Handle Slug (ID) Change
    if (newId && newId !== boardId) {
      // For now, slug migration is a manual transaction in the route 
      // since BoardService doesn't have updateSlug yet
      const existing = await prisma.board.findUnique({ where: { id: newId } });
      if (existing) {
        return NextResponse.json({ error: "이미 존재하는 고유 ID(Slug)입니다." }, { status: 400 });
      }

      const board = await prisma.board.findUnique({ where: { id: boardId } });
      if (!board || (board as any).userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.board.create({
          data: {
            ...board,
            id: newId,
            name: updateData.name ?? board.name,
            description: (updateData as any).description ?? (board as any).description,
            coverImage: (updateData as any).coverImage ?? (board as any).coverImage,
          } as any,
        });

        await tx.thread.updateMany({ where: { boardId }, data: { boardId: newId } });
        await tx.response.updateMany({ where: { boardId }, data: { boardId: newId } });
        await tx.notice.updateMany({ where: { boardId }, data: { boardId: newId } });
        await tx.board.delete({ where: { id: boardId } });
      });

      return NextResponse.json({ id: newId });
    }

    const updated = await boardService.update(session.user.id, boardId, {
      name: updateData.name,
      description: updateData.description,
      coverImage: updateData.coverImage,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update novel:", error);
    return NextResponse.json({ error: "소설 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}
