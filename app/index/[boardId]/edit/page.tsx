import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { boardService, BoardServiceError } from "@/lib/services/board";
import { permissionService } from "@/lib/services/permission";
import { NovelEditContent } from "./novel-edit-content";

interface Props {
  params: Promise<{ boardId: string }>;
}

export default async function EditNovelPage({ params }: Props) {
  const { boardId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  try {
    const board = await boardService.findById(boardId);

    // Permission check: Author or Admin
    const canAccessAdmin = await permissionService.checkUserPermission(session.user.id, "admin:read");
    const isAuthor = board.userId === session.user.id;

    if (!isAuthor && !canAccessAdmin) {
      redirect(`/index/${boardId}`);
    }

    const tCommon = await getTranslations("common");

    return (
      <NovelEditContent
        boardId={boardId}
        initialData={{
          name: board.name,
          description: board.description || "",
          coverImage: board.coverImage || "",
        }}
        isLoggedIn={true}
        canAccessAdmin={canAccessAdmin}
        authLabels={{
          login: tCommon("login"),
          logout: tCommon("logout"),
        }}
      />
    );
  } catch (error) {
    if (error instanceof BoardServiceError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
