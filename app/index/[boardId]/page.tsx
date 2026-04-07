import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { permissionService } from "@/lib/services/permission";
import { boardService, BoardServiceError } from "@/lib/services/board";
import { threadService } from "@/lib/services/thread";
import { noticeService } from "@/lib/services/notice";
import { globalSettingsService } from "@/lib/services/global-settings";
import { isRealtimeEnabled } from "@/lib/realtime";
import { favoriteService } from "@/lib/services/favorite";
import { toISOString } from "@/lib/cache";
import { BoardIndexContent } from "./board-index-content";

interface Props {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { boardId } = await params;
  try {
    const [board, settings] = await Promise.all([
      boardService.findById(boardId),
      globalSettingsService.get(),
    ]);
    return {
      title: `${settings.siteTitle} - ${board.name}`,
    };
  } catch {
    return {};
  }
}

export default async function BoardIndexPage({ params, searchParams }: Props) {
  const { boardId } = await params;
  const { page: pageParam, search } = await searchParams;
  const page = parseInt(pageParam ?? "1", 10);

  try {
    const [board, allBoards, session, settings] = await Promise.all([
      boardService.findById(boardId),
      boardService.findAll(),
      getServerSession(authOptions),
      globalSettingsService.get(),
    ]);
    const [threadResult, notices] = await Promise.all([
      threadService.findByBoardId(boardId, { page, search }),
      noticeService.findPinnedAndRecent(boardId, 5),
    ]);

    const t = await getTranslations("boardIndex");
    const tCommon = await getTranslations("common");

    const canAccessAdmin = session
      ? await permissionService.checkUserPermission(session.user.id, "admin:read")
      : false;

    let isFavorited = false;
    let isAuthorFavorited = false;
    if (session?.user?.id) {
      [isFavorited, isAuthorFavorited] = await Promise.all([
        favoriteService.isBoardFavorited(session.user.id, boardId),
        favoriteService.isAuthorFavorited(session.user.id, board.userId || ""),
      ]);
    }

    return (
      <BoardIndexContent
        boardId={boardId}
        boardName={board.name}
        description={board.description}
        coverImage={board.coverImage}
        boards={allBoards.map((b) => ({ id: b.id, name: b.name }))}
        isLoggedIn={!!session}
        canAccessAdmin={canAccessAdmin}
        currentUserId={session?.user?.id}
        boardOwnerId={board.userId}
        initialIsFavorited={isFavorited}
        initialIsAuthorFavorited={isAuthorFavorited}
        authLabels={{ login: tCommon("login"), logout: tCommon("logout") }}
        threads={threadResult.data.map((thread) => ({
          id: thread.id,
          title: thread.title,
          username: thread.username,
          ended: thread.ended,
          top: thread.top,
          responseCount: thread.responseCount,
          createdAt: toISOString(thread.createdAt),
          updatedAt: toISOString(thread.updatedAt),
        }))}
        pagination={threadResult.pagination}
        search={search ?? ""}
        labels={{
          createThread: t("createThread"),
          noThreads: t("noThreads"),
          searchPlaceholder: t("searchPlaceholder"),
          searchButton: t("searchButton"),
        }}
        boardsTitle={tCommon("boards")}
        manualLabel={tCommon("manual")}
        customLinks={settings.customLinks}
        indexCustomHtml={settings.indexCustomHtml}
      />
    );
  } catch (error) {
    if (error instanceof BoardServiceError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
