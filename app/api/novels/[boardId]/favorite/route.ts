import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { favoriteService } from "@/lib/services/favorite";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;
  try {
    const result = await favoriteService.toggleBoardFavorite(session.user.id, boardId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Favorite API Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ favorited: false });

  const { boardId } = await params;
  const favorited = await favoriteService.isBoardFavorited(session.user.id, boardId);
  return NextResponse.json({ favorited });
}
