import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/lib/services/board";
import { favoriteService } from "@/lib/services/favorite";
import { globalSettingsService } from "@/lib/services/global-settings";
import { MyPageContent } from "./mypage-content";
import { toISOString } from "@/lib/cache";
import { redirect } from "next/navigation";

export default async function MyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/mypage");
  }

  const userId = session.user.id;

  const [myNovels, favs, followedWorks, settings] = await Promise.all([
    boardService.findByUserId(userId),
    favoriteService.getFavoriteBoards(userId),
    favoriteService.getNovelsByFavoriteAuthors(userId),
    globalSettingsService.get(),
  ]);

  const tCommon = await getTranslations("common");

  const mapNovel = (b: any) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    coverImage: b.coverImage,
    episodeCount: b._count?.threads ?? 0,
    updatedAt: toISOString(b.updatedAt),
  });

  return (
    <MyPageContent
      myNovels={myNovels.map(mapNovel)}
      favoriteNovels={favs.map((f: any) => mapNovel(f.board))}
      authorNovels={followedWorks.map(mapNovel)}
      isLoggedIn={true}
      canAccessAdmin={false} // Will be checked in PageLayout if needed, but for MyPage we just need user status
      authLabels={{ login: tCommon("login"), logout: tCommon("logout") }}
      siteName={settings.siteTitle}
    />
  );
}
