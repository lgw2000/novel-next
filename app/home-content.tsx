"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { formatDateTime } from "@/lib/utils/date-formatter";
import { BoardListSidebar } from "@/components/sidebar/BoardListSidebar";

const Container = styled.div`
  padding: ${(props) => props.theme.containerPadding};
  max-width: ${(props) => props.theme.contentMaxWidth};
  margin: 0 auto;
`;

const HeroBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: center;
  margin-bottom: 3.2rem;
  padding: 2rem 2.4rem;
  background: ${(props) => props.theme.surface};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.6rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const SearchForm = styled.form`
  display: flex;
  flex: 1;
  gap: 1rem;
  min-width: 25rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1.1rem 1.6rem;
  background: ${(props) => props.theme.surfaceHover};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 0.8rem;
  font-size: 1.6rem;
  color: ${(props) => props.theme.textPrimary};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    background: ${(props) => props.theme.surface};
  }

  &::placeholder {
    color: ${(props) => props.theme.textMuted};
  }
`;

const SearchButton = styled.button`
  padding: 0 2rem;
  background: ${(props) => props.theme.primary};
  color: white;
  border: none;
  border-radius: 0.8rem;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 8rem 2rem;
  color: ${(props) => props.theme.textSecondary};
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.6rem;

  h2 { font-size: 3.2rem; margin-bottom: 1.6rem; }
  p { font-size: 1.6rem; max-width: 40rem; margin: 0 auto; }
`;

const NovelSection = styled.section`
  margin-bottom: 4.8rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
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
    height: 2.4rem;
    background: ${(props) => props.theme.primary};
    border-radius: 0.2rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
`;

const WriteButton = styled(Link)`
  padding: 1.1rem 2.2rem;
  background: ${(props) => props.theme.accent || props.theme.primary};
  color: white;
  border-radius: 0.8rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;

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

interface AuthLabels {
  login: string;
  logout: string;
}

interface CustomLink {
  id: string;
  label: string;
  url: string;
}

export interface HomeContentProps {
  recentNovels: NovelData[];
  favoriteNovels: NovelData[];
  authorNovels: NovelData[];
  isLoggedIn: boolean;
  canAccessAdmin: boolean;
  authLabels: AuthLabels;
  siteName: string;
  homepageContent: string | null;
  customLinks?: CustomLink[];
}

function NovelList({ novels, emptyMessage }: { novels: NovelData[]; emptyMessage: string }) {
  const locale = useLocale();
  
  if (novels.length === 0) {
    return (
      <div style={{ padding: "2rem", color: "#8899aa", fontSize: "1.4rem", background: "rgba(0,0,0,0.03)", borderRadius: "1.2rem", textAlign: "center" }}>
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
                총 <EpisodeCount>{novel.episodeCount}</EpisodeCount>화 연재 중
              </span>
              <span>{formatDateTime(novel.updatedAt, locale)}</span>
            </CardFooter>
          </CardContent>
        </NovelCard>
      ))}
    </NovelGrid>
  );
}

export function HomeContent({
  recentNovels,
  favoriteNovels,
  authorNovels,
  isLoggedIn,
  canAccessAdmin,
  authLabels,
  siteName,
  homepageContent,
  customLinks,
}: HomeContentProps) {
  return (
    <PageLayout
      title={siteName}
      sidebar={<BoardListSidebar boards={recentNovels.map((n) => ({ id: n.id, name: n.name }))} searchOnly={true} />}
      isLoggedIn={isLoggedIn}
      canAccessAdmin={canAccessAdmin}
      authLabels={authLabels}
      isHomePage
    >
      <Container>
        {homepageContent?.trim() && (
          <div
            style={{ marginBottom: "4rem", padding: "2.4rem", background: "rgba(0, 113, 188, 0.05)", borderRadius: "1.6rem", border: "1px solid rgba(0, 113, 188, 0.1)", fontSize: "1.5rem", lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: homepageContent }}
          />
        )}

        <HeroBar>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: "0.8rem" }}>반갑습니다, 작가님!</h1>
            <p style={{ color: "#8899aa", fontSize: "1.4rem" }}>오늘도 당신의 멋진 이야기를 들려주세요.</p>
          </div>
          <ActionButtons>
            {isLoggedIn && (
              <WriteButton href="/novels/create">
                ✍️ 새 소설 집필하기
              </WriteButton>
            )}
          </ActionButtons>
        </HeroBar>

        {isLoggedIn && (
          <>
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
                emptyMessage="선호 작가의 최신 소설이 이곳에 표시됩니다." 
              />
            </NovelSection>
          </>
        )}

        <NovelSection>
          <SectionTitle>🆕 최근 등록된 소설</SectionTitle>
          <NovelList 
            novels={recentNovels} 
            emptyMessage="등록된 소설이 없습니다." 
          />
        </NovelSection>
      </Container>
    </PageLayout>
  );
}
