"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faList, faSearch, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useSidebarContext } from "./SidebarContext";
import { usePathname } from "next/navigation";

const Wrapper = styled.div`
  padding: 0 1.2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: ${(props) => props.theme.textSecondary};
  cursor: pointer;
  font-size: 1.6rem;
  padding: 0.4rem;
  border-radius: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(props) => props.theme.surfaceHover};
    color: ${(props) => props.theme.textPrimary};
  }
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${(props) => props.theme.textPrimary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 1.6rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1.2rem 0.8rem 3.2rem;
  background: ${(props) => props.theme.surfaceHover};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 0.6rem;
  color: ${(props) => props.theme.textPrimary};
  font-size: 1.3rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => props.theme.textMuted};
  font-size: 1.2rem;
`;

const ChaptersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const ChapterItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem 1.2rem;
  border-radius: 0.6rem;
  text-decoration: none;
  font-size: 1.4rem;
  color: ${(props) => (props.$active ? props.theme.primary : props.theme.textSecondary)};
  background: ${(props) => (props.$active ? `${props.theme.primary}10` : "transparent")};
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  transition: all 0.15s;

  &:hover {
    background: ${(props) => (props.$active ? `${props.theme.primary}15` : props.theme.surfaceHover)};
    color: ${(props) => props.theme.textPrimary};
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${(props) => props.theme.textMuted};
  font-size: 1.4rem;
`;

export function SidebarChapters() {
  const { boardId, boardName, setMode, onClose } = useSidebarContext();
  const pathname = usePathname();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!boardId) return;

    async function fetchChapters() {
      setLoading(true);
      try {
        const res = await fetch(`/api/novels/${boardId}/chapters`);
        const data = await res.json();
        setChapters(data.chapters || []);
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChapters();
  }, [boardId]);

  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Wrapper>
      <Header>
        <Title>Navigation</Title>
      </Header>

      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.6rem" }}>
        <ChapterItem 
          as="button" 
          href="#" 
          onClick={(e: any) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{ flex: 1, justifyContent: "center", padding: "0.8rem" }}
        >
          <FontAwesomeIcon icon={faChevronUp} style={{ marginRight: "0.6rem", opacity: 0.7 }} />
          맨위
        </ChapterItem>
        <ChapterItem 
          as="button" 
          href="#" 
          onClick={(e: any) => { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}
          style={{ flex: 1, justifyContent: "center", padding: "0.8rem" }}
        >
          <FontAwesomeIcon icon={faChevronDown} style={{ marginRight: "0.6rem", opacity: 0.7 }} />
          맨아래
        </ChapterItem>
      </div>

      <div style={{ padding: "0 1.2rem", fontSize: "1.1rem", fontWeight: 700, color: "#8899aa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.8rem", opacity: 0.6 }}>
        Episodes
      </div>


      {loading ? (
        <LoadingState>로딩 중...</LoadingState>
      ) : (
        <ChaptersList>
          {filteredChapters.map((chapter) => {
            const href = `/trace/${boardId}/${chapter.id}`;
            const isActive = pathname.startsWith(href);
            return (
              <ChapterItem 
                key={chapter.id} 
                href={href}
                $active={isActive}
                onClick={() => onClose()}
              >
                {chapter.title}
              </ChapterItem>
            );
          })}
          {filteredChapters.length === 0 && (
            <LoadingState>화차가 없습니다.</LoadingState>
          )}
        </ChaptersList>
      )}
    </Wrapper>
  );
}
