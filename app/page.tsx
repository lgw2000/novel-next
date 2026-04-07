import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { permissionService } from "@/lib/services/permission";
import { boardService } from "@/lib/services/board";
import { globalSettingsService } from "@/lib/services/global-settings";
import { HomeContent } from "./home-content";
import { prisma } from "@/lib/prisma";
import { toISOString } from "@/lib/cache";
import { favoriteService } from "@/lib/services/favorite";

export default async function HomePage() {
  const [allBoards, session, settings] = await Promise.all([
    prisma.board.findMany({
      where: { deleted: false },
      orderBy: { createdAt: "desc" },
      take: 20, // Only show recent 20 in the main "Recent" section
      include: {
        _count: {
          select: { threads: { where: { published: true, deleted: false } } }
        }
      }
    }),
    getServerSession(authOptions),
    globalSettingsService.get(),
  ]);

  let favoriteNovels: any[] = [];
  let authorNovels: any[] = [];

  if (session?.user?.id) {
    const [favs, followedWorks] = await Promise.all([
      favoriteService.getFavoriteBoards(session.user.id),
      favoriteService.getNovelsByFavoriteAuthors(session.user.id),
    ]);
    favoriteNovels = favs.map((f: any) => f.board);
    authorNovels = followedWorks;
  }

  const tCommon = await getTranslations("common");
  
  const canAccessAdmin = session
    ? await permissionService.checkUserPermission(session.user.id, "admin:read")
    : false;

  const mapNovel = (b: any) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    coverImage: b.coverImage,
    episodeCount: b._count.threads,
    updatedAt: toISOString(b.updatedAt),
  });

  return (
    <HomeContent
      recentNovels={allBoards.map(mapNovel)}
      favoriteNovels={favoriteNovels.map(mapNovel)}
      authorNovels={authorNovels.map(mapNovel)}
      isLoggedIn={!!session}
      canAccessAdmin={canAccessAdmin}
      authLabels={{ login: tCommon("login"), logout: tCommon("logout") }}
      siteName={settings.siteTitle}
      homepageContent={settings.homepageContent}
      customLinks={settings.customLinks}
    />
  );
}
