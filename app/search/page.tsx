"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark, faBook } from "@fortawesome/free-solid-svg-icons";
import { BoardListSidebar } from "@/components/sidebar/BoardListSidebar";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

const Container = styled.div`
  padding: ${(props) => props.theme.containerPadding};
  max-width: ${(props) => props.theme.contentMaxWidth};
  margin: 0 auto;
`;

const SearchHeader = styled.div`
  margin-bottom: 4.8rem;
  text-align: center;
`;

const SearchTitle = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: ${(props) => props.theme.textPrimary};
  margin-bottom: 2.4rem;
  letter-spacing: -0.02em;
`;

const SearchBox = styled.div`
  position: relative;
  max-width: 60rem;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.6rem 2rem 1.6rem 5.4rem;
  background: ${(props) => props.theme.surface};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 2rem;
  font-size: 1.8rem;
  color: ${(props) => props.theme.textPrimary};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => props.theme.textMuted};
  font-size: 2rem;
  pointer-events: none;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
  gap: 3.2rem;
  margin-top: 4rem;
`;

const NovelCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.surface};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.6rem;
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
  font-size: 4rem;
`;

const CardContent = styled.div`
  padding: 1.6rem;
`;

const NovelName = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${(props) => props.theme.textPrimary};
  margin-bottom: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NovelDescription = styled.p`
  font-size: 1.3rem;
  color: ${(props) => props.theme.textSecondary};
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: 6.4rem 2rem;
  color: ${(props) => props.theme.textSecondary};
  font-size: 1.6rem;
`;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const { data: session } = useSession();
  const t = useTranslations("common");

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.novels || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleUpdateQuery = (newQuery: string) => {
    setQuery(newQuery);
    // Update URL without reloading
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set("q", newQuery);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <PageLayout 
      title="소설 검색" 
      sidebar={<BoardListSidebar boards={[]} searchOnly={true} />}
      isLoggedIn={!!session}
      canAccessAdmin={false}
      authLabels={{ login: t("login"), logout: t("logout") }}
    >
      <Container>
        <SearchHeader>
          <SearchTitle>어떤 이야기를 찾고 계신가요?</SearchTitle>
          <SearchBox>
            <SearchIconWrapper>
              <FontAwesomeIcon icon={faSearch} />
            </SearchIconWrapper>
            <SearchInput
              type="text"
              placeholder="제목, 시놉시스 검색..."
              value={query}
              onChange={(e) => handleUpdateQuery(e.target.value)}
              autoFocus
            />
          </SearchBox>
        </SearchHeader>

        {loading ? (
          <StatusMessage>검색 중...</StatusMessage>
        ) : query.trim() && results.length === 0 ? (
          <StatusMessage>검색 결과가 없습니다.</StatusMessage>
        ) : results.length > 0 ? (
          <ResultsGrid>
            {results.map((novel) => (
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
                    <FontAwesomeIcon icon={faBook} style={{ opacity: 0.2 }} />
                  )}
                </CoverWrapper>
                <CardContent>
                  <NovelName>{novel.name}</NovelName>
                  <NovelDescription>{novel.description || "소개 없음"}</NovelDescription>
                </CardContent>
              </NovelCard>
            ))}
          </ResultsGrid>
        ) : (
          <StatusMessage>검색어를 입력하여 소설을 찾아보세요.</StatusMessage>
        )}
      </Container>
    </PageLayout>
  );
}
