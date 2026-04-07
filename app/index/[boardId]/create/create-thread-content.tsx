"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styled from "styled-components";
import { PageLayout } from "@/components/layout";
import { CreateThreadOptionButtons, CreateThreadOptions } from "@/components/response/CreateThreadOptionButtons";
import { ContentPreview } from "@/components/response/ContentPreview";
import { applyShortcuts } from "@/lib/utils/shortcuts";

const Container = styled.div`
  padding: ${(props) => props.theme.containerPadding};
  max-width: 90rem;
  margin: 0 auto;
`;

const WriterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2.4rem;
  margin-bottom: 4rem;
  padding: 2.4rem;
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.6rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
`;

const SmallCover = styled.div`
  width: 6rem;
  height: 8rem;
  border-radius: 0.8rem;
  overflow: hidden;
  flex-shrink: 0;
  background: ${(props) => props.theme.surfaceHover};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
`;

const NovelMeta = styled.div`
  flex: 1;
`;

const NovelTitle = styled.div`
  font-size: 1.4rem;
  color: ${(props) => props.theme.textSecondary};
  margin-bottom: 0.4rem;
`;

const ActionTitle = styled.h1`
  font-size: 2.4rem;
  font-weight: 800;
  color: ${(props) => props.theme.textPrimary};
`;

const WritingSheet = styled.div`
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 2rem;
  padding: 4rem;
  box-shadow: 0 12px 64px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 3.2rem;

  @media (max-width: 768px) {
    padding: 2.4rem;
  }
`;

const MainTitleInput = styled.input`
  width: 100%;
  font-size: 3.2rem;
  font-weight: 800;
  border: none;
  background: transparent;
  color: ${(props) => props.theme.textPrimary};
  padding: 0;
  margin-bottom: 1.6rem;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }

  &::placeholder {
    opacity: 0.3;
  }
`;

const StoryArea = styled.textarea`
  width: 100%;
  min-height: 50rem;
  font-size: 1.8rem;
  line-height: 2;
  border: none;
  background: transparent;
  color: ${(props) => props.theme.textPrimary};
  resize: none;
  padding: 0;
  opacity: 0.9;

  &:focus {
    outline: none;
  }

  &::placeholder {
    opacity: 0.3;
  }
`;

const StickyActions = styled.div`
  position: sticky;
  bottom: 2rem;
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.2rem;
  padding: 1.2rem 2.4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(12px);
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.1);
  margin-top: 4rem;
`;

const SubmitButton = styled.button`
  padding: 1rem 2.4rem;
  background: ${(props) => props.theme.primary};
  color: white;
  border: none;
  border-radius: 0.8rem;
  font-size: 1.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 1rem 2rem;
  background: transparent;
  color: ${(props) => props.theme.textSecondary};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 0.8rem;
  font-size: 1.5rem;
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.surfaceHover};
  }
`;

interface Labels {
  creating: string;
}

interface AuthLabels {
  login: string;
  logout: string;
}

interface CreateThreadContentProps {
  boardId: string;
  boardName: string;
  coverImage?: string | null;
  userId?: string;
  isLoggedIn: boolean;
  canAccessAdmin: boolean;
  authLabels: AuthLabels;
  labels: Labels;
}

export function CreateThreadContent({
  boardId,
  boardName,
  coverImage,
  isLoggedIn,
  canAccessAdmin,
  authLabels,
  labels: commonLabels,
}: CreateThreadContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<CreateThreadOptions>({
    aaMode: false,
    previewMode: false,
  });

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToggleOption = (key: keyof CreateThreadOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getFinalContent = (content: string) => {
    if (options.aaMode && content.trim()) return `[aa]${content}[/aa]`;
    return content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Create episode (thread)
      const threadRes = await fetch(`/api/boards/${boardId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          password: "author-managed", // We can use a standard password for author-owned boards
        }),
      });

      if (!threadRes.ok) throw new Error("에피소드를 생성할 수 없습니다.");
      const thread = await threadRes.json();

      // 2. Create the first content response (seq 0)
      const finalContent = getFinalContent(formData.content);
      const responseRes = await fetch(`/api/boards/${boardId}/threads/${thread.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: finalContent,
        }),
      });

      if (!responseRes.ok) throw new Error("본문을 저장할 수 없습니다.");

      router.push(`/trace/${boardId}/${thread.id}/recent`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title={`${boardName} - 새 연재`}
      isLoggedIn={isLoggedIn}
      canAccessAdmin={canAccessAdmin}
      authLabels={authLabels}
    >
      <Container>
        <WriterHeader>
          <SmallCover>
            {coverImage ? (
              <Image src={coverImage} alt={boardName} fill style={{ objectFit: "cover" }} unoptimized />
            ) : "📖"}
          </SmallCover>
          <NovelMeta>
            <NovelTitle>{boardName}</NovelTitle>
            <ActionTitle>에피소드 연재하기</ActionTitle>
          </NovelMeta>
        </WriterHeader>

        {error && <div style={{ color: "red", marginBottom: "2rem" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <WritingSheet>
            <MainTitleInput
              placeholder="화 제목을 입력하세요..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
              required
              maxLength={200}
            />

            <CreateThreadOptionButtons
              options={options}
              onToggle={handleToggleOption}
              labels={{ aaMode: "AA 모드", previewMode: "미리보기" }}
            />

            {options.previewMode && (
              <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "10px" }}>
                <ContentPreview content={getFinalContent(formData.content)} boardId={boardId} emptyLabel="미리보기 내용이 없습니다." />
              </div>
            )}

            <StoryArea
              ref={textareaRef}
              placeholder="여기에 소설의 멋진 본문을 작성하세요..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: applyShortcuts(e.target.value) })}
              required
            />
          </WritingSheet>

          <StickyActions>
            <CancelButton type="button" onClick={() => router.back()}>
              취소
            </CancelButton>
            <SubmitButton type="submit" disabled={loading || !formData.title.trim() || !formData.content.trim()}>
              {loading ? commonLabels.creating : "✨ 연재 시작하기"}
            </SubmitButton>
          </StickyActions>
        </form>
      </Container>
    </PageLayout>
  );
}
