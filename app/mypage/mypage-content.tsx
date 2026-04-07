"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { PageLayout } from "@/components/layout";
import { formatDateTime } from "@/lib/utils/date-formatter";

const Container = styled.div`
  padding: ${(props) => props.theme.containerPadding};
  max-width: ${(props) => props.theme.contentMaxWidth};
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3.2rem;
  padding: 2.4rem;
  background: ${(props) => props.theme.surface};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.6rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 2.8rem;
    font-weight: 800;
    margin-bottom: 0.8rem;
    color: ${(props) => props.theme.textPrimary};
  }
  p {
    color: ${(props) => props.theme.textMuted};
    font-size: 1.5rem;
  }
`;

const NovelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
  gap: 2.4rem;
  margin-bottom: 4rem;
`;

const NovelCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.surface};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.2rem;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
`;

const CoverWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: ${(props) => props.theme.surfaceHover};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
`;

const CardContent = styled.div`
  padding: 1.8rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const NovelTitle = styled.h3`
  font-size: 1.9rem;
  font-weight: 700;
  color: ${(props) => props.theme.textPrimary};
  margin-bottom: 0.8rem;
  line-height: 1.3;
`;

const NovelDescription = styled.p`
  font-size: 1.4rem;
  color: ${(props) => props.theme.textSecondary};
  line-height: 1.6;
  margin-bottom: 1.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.2rem;
  border-top: 1px solid ${(props) => props.theme.surfaceBorder};
  font-size: 1.3rem;
  color: ${(props) => props.theme.textMuted};
`;

const EpisodeCount = styled.span`
  color: ${(props) => props.theme.primary};
  font-weight: 600;
`;

const NovelSection = styled.section`
  margin-bottom: 4.8rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${(props) => props.theme.textPrimary};
  margin-bottom: 2.4rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;

  &::before {
    content: "";
    display: block;
    width: 0.4rem;
    height: 2.2rem;
    background: ${(props) => props.theme.primary};
    border-radius: 0.2rem;
  }
`;

const WriteButton = styled(Link)`
  padding: 1.2rem 2.4rem;
  background: ${(props) => props.theme.primary};
  color: white;
  border-radius: 1rem;
  font-size: 1.6rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 1rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

interface NovelData {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  episodeCount: number;
  updatedAt: string;
}

interface MyPageContentProps {
  myNovels: NovelData[];
  favoriteNovels: NovelData[];
  authorNovels: NovelData[];
  isLoggedIn: boolean;
  canAccessAdmin: boolean;
  authLabels: { login: string; logout: string };
  siteName: string;
}

function NovelList({ novels, emptyMessage }: { novels: NovelData[]; emptyMessage: string }) {
  const locale = useLocale();
  
  if (novels.length === 0) {
    return (
      <div style={{ padding: "3rem", color: "#8899aa", fontSize: "1.5rem", background: "rgba(0,0,0,0.03)", borderRadius: "1.6rem", textAlign: "center", border: "1px dashed #cbd5e0" }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <NovelGrid>
      {novels.map((novel) => (
        <NovelCard key={novel.id} href={`/index/${novel.id}`}>
          <CoverWrapper>
            {novel.coverImage ? (
              <Image
                src={novel.coverImage}
                alt={novel.name}
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              "📖"
            )}
          </CoverWrapper>
          <CardContent>
            <NovelTitle>{novel.name}</NovelTitle>
            <NovelDescription>
              {novel.description || "등록된 소개글이 없습니다."}
            </NovelDescription>
            <CardFooter>
              <span>
                총 <EpisodeCount>{novel.episodeCount}</EpisodeCount>화
              </span>
              <span>{formatDateTime(novel.updatedAt, locale)}</span>
            </CardFooter>
          </CardContent>
        </NovelCard>
      ))}
    </NovelGrid>
  );
}

export function MyPageContent({
  myNovels,
  favoriteNovels,
  authorNovels,
  isLoggedIn,
  canAccessAdmin,
  authLabels,
  siteName,
}: MyPageContentProps) {
  return (
    <PageLayout
      title="마이페이지"
      isLoggedIn={isLoggedIn}
      canAccessAdmin={canAccessAdmin}
      authLabels={authLabels}
      isMyPage
    >
      <Container>
        <HeaderSection>
          <TitleGroup>
            <h1>마이페이지</h1>
            <p>당신의 창작 활동과 선호 작품들을 한눈에 확인하세요.</p>
          </TitleGroup>
          <WriteButton href="/novels/create">
            ✍️ 새 소설 집필하기
          </WriteButton>
        </HeaderSection>

        <NovelSection>
          <SectionTitle>✒️ 내가 집필 중인 소설</SectionTitle>
          <NovelList 
            novels={myNovels} 
            emptyMessage="아직 집필 중인 소설이 없습니다. 새로운 이야기를 시작해보세요!" 
          />
        </NovelSection>

        <NovelSection>
          <SectionTitle>❤️ 선호 작품</SectionTitle>
          <NovelList 
            novels={favoriteNovels} 
            emptyMessage="아직 선호 작품이 없습니다. 마음에 드는 소설에 하트를 눌러보세요!" 
          />
        </NovelSection>

        <NovelSection>
          <SectionTitle>⭐ 선호 작가의 작품</SectionTitle>
          <NovelList 
            novels={authorNovels} 
            emptyMessage="선호하는 작가의 작품이 아직 없습니다." 
          />
        </NovelSection>
      </Container>
    </PageLayout>
  );
}
