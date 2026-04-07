import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { favoriteService } from "@/lib/services/favorite";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ authorId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { authorId } = await params;
  try {
    const result = await favoriteService.toggleAuthorFavorite(session.user.id, authorId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Follow API Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ authorId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ favorited: false });

  const { authorId } = await params;
  const favorited = await favoriteService.isAuthorFavorited(session.user.id, authorId);
  return NextResponse.json({ favorited });
}
