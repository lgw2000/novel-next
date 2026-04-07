"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark, faBook } from "@fortawesome/free-solid-svg-icons";
import { useSidebarContext } from "./SidebarContext";

const SearchWrapper = styled.div`
  padding: 0 1.2rem;
`;

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.6rem;
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${(props) => props.theme.textPrimary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${(props) => props.theme.textSecondary};
  cursor: pointer;
  font-size: 1.6rem;
  padding: 0.4rem;
  border-radius: 0.4rem;

  &:hover {
    background: ${(props) => props.theme.surfaceHover};
    color: ${(props) => props.theme.textPrimary};
  }
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.2rem 1rem 3.6rem;
  background: ${(props) => props.theme.surfaceHover};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 0.8rem;
  color: ${(props) => props.theme.textPrimary};
  font-size: 1.4rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => props.theme.textMuted};
  font-size: 1.4rem;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const ResultItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem;
  border-radius: 0.8rem;
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: ${(props) => props.theme.surfaceHover};
  }
`;

const ResultIcon = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  background: ${(props) => props.theme.primary}20;
  color: ${(props) => props.theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.6rem;
  font-size: 1.4rem;
`;

const ResultInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultName = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${(props) => props.theme.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ResultDescription = styled.div`
  font-size: 1.2rem;
  color: ${(props) => props.theme.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function SidebarSearch() {
  const { setMode, onClose } = useSidebarContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
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
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <SearchWrapper>
      <SearchHeader>
        <Title>소설 검색</Title>
        <CloseButton onClick={() => setMode("navigation")}>
          <FontAwesomeIcon icon={faXmark} />
        </CloseButton>
      </SearchHeader>

      <InputWrapper>
        <SearchIcon>
          <FontAwesomeIcon icon={faSearch} />
        </SearchIcon>
        <Input
          autoFocus
          placeholder="제목 또는 설명 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputWrapper>

      <ResultsList>
        {results.map((novel) => (
          <ResultItem 
            key={novel.id} 
            href={`/index/${novel.id}`}
            onClick={() => onClose?.()}
          >
            <ResultIcon>
              <FontAwesomeIcon icon={faBook} />
            </ResultIcon>
            <ResultInfo>
              <ResultName>{novel.name}</ResultName>
              <ResultDescription>{novel.description || "소개 없음"}</ResultDescription>
            </ResultInfo>
          </ResultItem>
        ))}
        {query.trim() && !loading && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#8899aa", fontSize: "1.4rem" }}>
            검색 결과가 없습니다.
          </div>
        )}
      </ResultsList>
    </SearchWrapper>
  );
}
