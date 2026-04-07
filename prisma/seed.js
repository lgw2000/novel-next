// prisma/seed.js - 기본 장르 게시판 생성 스크립트
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const boards = [
    { id: "general", name: "일반소설", defaultUsername: "작가" },
    { id: "fantasy", name: "판타지", defaultUsername: "작가" },
    { id: "romance", name: "로맨스", defaultUsername: "작가" },
    { id: "action", name: "액션", defaultUsername: "작가" },
    { id: "horror", name: "공포/스릴러", defaultUsername: "작가" },
    { id: "sf", name: "SF/판타지", defaultUsername: "작가" },
  ];

  for (const board of boards) {
    await prisma.board.upsert({
      where: { id: board.id },
      update: {},
      create: board,
    });
    console.log(`✅ 게시판 생성: ${board.name} (${board.id})`);
  }

  // 글로벌 설정 기본값 생성
  await prisma.globalSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteTitle: "소설 플랫폼",
      siteDescription: "당신의 이야기를 연재하세요",
    },
  });
  console.log("✅ 글로벌 설정 완료");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
