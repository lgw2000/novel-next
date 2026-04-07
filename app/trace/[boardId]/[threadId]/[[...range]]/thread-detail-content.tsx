"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { PageLayout } from "@/components/layout";
import { ResponseCard } from "@/components/response";
import { ResponseFormSection } from "@/components/response/ResponseFormSection";
import { useResponseOptions } from "@/lib/hooks/useResponseOptions";
import { usePresence } from "@/lib/hooks/usePresence";
import { CHANNELS } from "@/lib/realtime";
import { formatDateTime } from "@/lib/utils/date-formatter";
import { TraceSidebar } from "@/components/sidebar/TraceSidebar";
import { useLocale, useTranslations } from "next-intl";
import { getAnonId } from "@/lib/utils/anon-id";
import { parse, prerender, render } from "@/lib/tom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faUserPlus, faHeartCircleCheck, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { useRealtime } from "@/lib/hooks/useRealtime";
import { EVENTS } from "@/lib/realtime";

const Container = styled.div`
  padding: 4rem 2rem;
  max-width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 2.4rem 1.2rem;
  }
`;

const ChapterHeader = styled.div`
  margin-bottom: 64px;
  text-align: center;
`;

const NovelBreadcrumb = styled.div`
  font-size: 1.6rem;
  color: ${(props) => props.theme.primary};
  font-weight: 700;
  margin-bottom: 1.2rem;
  opacity: 0.8;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ChapterTitle = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  color: ${(props) => props.theme.textPrimary};
  margin-bottom: 1.6rem;
  line-height: 1.2;
`;

const ChapterMeta = styled.div`
  font-size: 1.4rem;
  color: ${(props) => props.theme.textSecondary};
  opacity: 0.7;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.6rem;
`;

const AuthorControls = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 1.6rem;
  justify-content: center;
`;

const ControlButton = styled.button<{ $danger?: boolean }>`
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  background: ${(props) => props.$danger ? "rgba(255, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.05)"};
  color: ${(props) => props.$danger ? "#ff4444" : props.theme.textSecondary};
  border: 1px solid ${(props) => props.$danger ? "#ff4444" : props.theme.surfaceBorder};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.$danger ? "#ff4444" : props.theme.primary};
    color: white;
  }
`;

const FavoriteButton = styled.button<{ $active?: boolean; $isAuthor?: boolean }>`
  padding: 0.6rem 1.2rem;
  background: ${(props) => props.$active ? (props.$isAuthor ? "#ff9f43" : "#ff4757") : "rgba(255, 255, 255, 0.05)"};
  color: ${(props) => props.$active ? "white" : props.theme.textSecondary};
  border: 1px solid ${(props) => props.$active ? "transparent" : props.theme.surfaceBorder};
  border-radius: 0.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
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

const ContentSheet = styled.div`
  background: ${(props) => props.theme.surface};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 2.4rem;
  padding: 6.4rem;
  box-shadow: 0 32px 128px rgba(0, 0, 0, 0.2);
  margin-bottom: 4.8rem;
  width: 100%;
  max-width: 180rem;

  @media (max-width: 768px) {
    padding: 3.2rem 2.4rem;
    border-radius: 1.6rem;
  }
`;

const MainStory = styled.div`
  font-size: 2rem;
  line-height: 2.2;
  color: ${(props) => props.theme.textPrimary};
  word-break: break-word;
  white-space: pre-wrap;
  
  p {
    margin-bottom: 2.4rem;
  }
`;

const Separator = styled.div`
  height: 2px;
  background: ${(props) => props.theme.surfaceBorder};
  margin: 6.4rem 0;
  opacity: 0.5;
`;

const AuthorNotesHeader = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${(props) => props.theme.primary};
  margin-bottom: 2.4rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const NavigationBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 2.4rem;
  margin-top: 8rem;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const NavButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 1.6rem 2.4rem;
  background: ${(props) => props.$primary ? props.theme.primary : props.theme.surface};
  color: ${(props) => props.$primary ? "white" : props.theme.textPrimary};
  border: 1px solid ${(props) => props.$primary ? "transparent" : props.theme.surfaceBorder};
  border-radius: 1.2rem;
  font-size: 1.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ChapterNavigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: 100%;
  margin: 3.2rem 0;

  @media (max-width: 500px) {
    gap: 1rem;
  }
`;

const NavLink = styled.button<{ $primary?: boolean }>`
  padding: 1rem 2rem;
  background: ${(props) => props.$primary ? props.theme.primary : "rgba(255, 255, 255, 0.05)"};
  color: ${(props) => props.$primary ? "white" : props.theme.textPrimary};
  border: 1px solid ${(props) => props.$primary ? "transparent" : props.theme.surfaceBorder};
  border-radius: 0.8rem;
  font-size: 1.4rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  &:hover {
    background: ${(props) => props.$primary ? props.theme.primary : "rgba(255, 255, 255, 0.1)"};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
    transform: none;
  }
`;

// Simple Modal Component
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: ${(props) => props.theme.surface};
  width: 100%;
  max-width: 60rem;
  border-radius: 1.6rem;
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  padding: 3.2rem;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
`;

const ModalTitle = styled.h2`
  font-size: 2.4rem;
  margin-bottom: 2.4rem;
  color: ${(props) => props.theme.textPrimary};
`;

const ModalField = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: ${(props) => props.theme.textSecondary};
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  color: white;
  padding: 1rem;
  border-radius: 0.6rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 20rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  color: white;
  padding: 1rem;
  border-radius: 0.6rem;
  resize: vertical;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 3.2rem;
`;

interface ResponseData {
  id: string;
  seq: number;
  username: string;
  authorId: string;
  userId: string | null;
  content: string;
  attachment: string | null;
  createdAt: string;
}

interface ThreadData {
  id: number;
  boardId: string;
  title: string;
  username: string;
  ended: boolean;
  top: boolean;
  createdAt: string;
  updatedAt: string;
}

import { useSidebarContext } from "@/components/sidebar/SidebarContext";
import { useEffect } from "react";

interface ThreadDetailContentProps {
  thread: {
    id: number;
    boardId: string;
    title: string;
    username: string;
    ended: boolean;
    top: boolean;
    createdAt: string;
    updatedAt: string;
  };
  boardName: string;
  boardOwnerId: string | null;
  boards: { id: string; name: string }[];
  defaultUsername: string;
  tripcodeSalt?: string;
  showUserCount: boolean;
  realtimeEnabled: boolean;
  storageEnabled: boolean;
  uploadMaxSize: number;
  isLoggedIn: boolean;
  currentUserId?: string;
  canAccessAdmin: boolean;
  canManageResponses: boolean;
  authLabels: { login: string; logout: string };
  responses: any[];
  currentView: string;
  lastSeq: number;
  responsesPerPage: number;
  labels: any;
  sidebarLabels: any;
  filter?: any;
  filterActive?: boolean;
  customLinks?: any[];
  threadCustomHtml?: string | null;
  initialIsFavorited?: boolean;
  initialIsAuthorFavorited?: boolean;
  prevThreadId?: number;
  nextThreadId?: number;
}

export function ThreadDetailContent({
  thread: initialThread,
  boardName,
  boardOwnerId,
  defaultUsername,
  tripcodeSalt,
  showUserCount,
  realtimeEnabled,
  storageEnabled,
  uploadMaxSize,
  isLoggedIn,
  currentUserId,
  canAccessAdmin,
  canManageResponses,
  authLabels,
  responses: initialResponses,
  currentView,
  lastSeq,
  responsesPerPage,
  labels,
  sidebarLabels,
  filter,
  filterActive = true,
  customLinks,
  threadCustomHtml,
  initialIsFavorited = false,
  initialIsAuthorFavorited = false,
  prevThreadId,
  nextThreadId,
}: ThreadDetailContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const { setMode, setBoardId, setBoardName } = useSidebarContext();

  useEffect(() => {
    setMode("chapters");
    setBoardId(initialThread.boardId);
    setBoardName(boardName);
  }, [initialThread.boardId, boardName, setMode, setBoardId, setBoardName]);

  const [thread, setThread] = useState<ThreadData>(initialThread);
  const [responses, setResponses] = useState(initialResponses);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // Favorite States
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isAuthorFavorited, setIsAuthorFavorited] = useState(initialIsAuthorFavorited);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isAuthorLoading, setIsAuthorLoading] = useState(false);
  
  const [editTitle, setEditTitle] = useState(thread.title);
  const [editContent, setEditContent] = useState("");

  const pageEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const alwaysBottomRef = useRef(false);

  const isAuthor = currentUserId === boardOwnerId;

  const {
    options: responseOptions,
    toggleOption,
    isGlobalActive,
    hasThreadOverride,
    resetAllThreadOptions,
  } = useResponseOptions(thread.boardId, thread.id);

  alwaysBottomRef.current = responseOptions.alwaysBottom;

  const currentLastSeq = useMemo(() => {
    if (responses.length === 0) return lastSeq;
    return Math.max(lastSeq, ...responses.map((r) => r.seq));
  }, [responses, lastSeq]);

  const anonId = useMemo(() => getAnonId(), []);

  const threadChannel = CHANNELS.thread(thread.id);
  usePresence(threadChannel, showUserCount);

  // Subscribe to new responses via realtime
  useRealtime(threadChannel, EVENTS.NEW_RESPONSE, (newResponse: any) => {
    setResponses((prev) => {
      // Check if this response already exists in the state
      const exists = prev.some((r) => r.id === newResponse.id);
      if (exists) return prev;
      return [...prev, newResponse];
    });
  }, realtimeEnabled);

  // Handle auto-scroll when new responses arrive
  useEffect(() => {
    if (responses.length > 0 && responseOptions.alwaysBottom && isAtBottomRef.current && pageEndRef.current) {
      pageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [responses.length, responseOptions.alwaysBottom]);

  const t = useTranslations("threadDetail");

  const renderContent = useCallback((content: string) => {
    try {
      const tom = parse(content);
      const pr = prerender(tom);
      return render(pr, { 
        boardId: thread.boardId, 
        threadId: thread.id,
        setAnchorInfo: () => {},
        t: t as any,
      });
    } catch (e) {
      return content;
    }
  }, [thread.boardId, thread.id, t]);

  const mainChapter = useMemo(() => responses.find((r) => r.seq === 0), [responses]);
  const comments = useMemo(() => responses.filter((r) => r.seq > 0), [responses]);

  const toggleThreadStatus = async () => {
    const newEnded = !thread.ended;
    try {
      const res = await fetch(`/api/boards/${thread.boardId}/threads/${thread.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ended: newEnded }),
      });
      if (res.ok) {
        setThread({ ...thread, ended: newEnded });
        router.refresh(); // Hard refresh to update form visibility across server components
      }
    } catch (e) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const openEditModal = () => {
    setEditTitle(thread.title);
    setEditContent(mainChapter?.content || "");
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      // 1. Update Title & Ended if needed
      const threadRes = await fetch(`/api/boards/${thread.boardId}/threads/${thread.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });

      // 2. Update Content (seq 0)
      if (mainChapter) {
        await fetch(`/api/boards/${thread.boardId}/threads/${thread.id}/responses/${mainChapter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        });
      }

      if (threadRes.ok) {
        setThread({ ...thread, title: editTitle });
        setResponses(responses.map(r => r.seq === 0 ? { ...r, content: editContent } : r));
        setEditModalOpen(false);
        router.refresh();
      }
    } catch (e) {
      alert("수정에 실패했습니다.");
    }
  };

  const handleDeleteResponse = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/boards/${thread.boardId}/threads/${thread.id}/responses/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Pass empty body to satisfy request.json()
      });
      if (res.ok) {
        setResponses(responses.filter(r => r.id !== id));
      } else {
        alert("삭제 권한이 없거나 오류가 발생했습니다.");
      }
    } catch (e) {
      alert("오류가 발생했습니다.");
    }
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }
    setIsFavoriteLoading(true);
    try {
      const res = await fetch(`/api/novels/${thread.boardId}/favorite`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.favorited);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`오류가 발생했습니다: ${errorData.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleToggleAuthorFavorite = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }
    if (!boardOwnerId) return;
    setIsAuthorLoading(true);
    try {
      const res = await fetch(`/api/authors/${boardOwnerId}/favorite`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsAuthorFavorited(data.favorited);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`오류가 발생했습니다: ${errorData.error || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsAuthorLoading(false);
    }
  };

  return (
    <PageLayout
      title={boardName || "에피소드"}
      sidebar={<TraceSidebar boardId={thread.boardId} />}
      isLoggedIn={isLoggedIn}
      canAccessAdmin={canAccessAdmin}
      authLabels={authLabels}
    >
      <Container>
        <ChapterHeader>
          <NovelBreadcrumb onClick={() => router.push(`/index/${thread.boardId}`)}>
            ← 목록으로 돌아가기
          </NovelBreadcrumb>
          <ChapterTitle>
            {thread.title}
            <span style={{ fontSize: "2rem", opacity: 0.5, marginLeft: "1.6rem", fontWeight: 500 }}>
              💬 {responses.length - 1}
            </span>
          </ChapterTitle>
          <ChapterMeta>
            최종 업데이트: {formatDateTime(thread.updatedAt, locale)}
          </ChapterMeta>
          
          <AuthorControls>
            {isLoggedIn && (
              <>
                <FavoriteButton 
                  onClick={handleToggleFavorite} 
                  $active={isFavorited}
                  disabled={isFavoriteLoading}
                >
                  <FontAwesomeIcon icon={isFavorited ? faHeartCircleCheck : faHeart} />
                  {isFavorited ? "서재 담김" : "서재 담기"}
                </FavoriteButton>
                {boardOwnerId && boardOwnerId !== currentUserId && (
                  <FavoriteButton 
                    onClick={handleToggleAuthorFavorite} 
                    $active={isAuthorFavorited}
                    $isAuthor
                    disabled={isAuthorLoading}
                  >
                    <FontAwesomeIcon icon={isAuthorFavorited ? faUserCheck : faUserPlus} />
                    {isAuthorFavorited ? "작가 팔로우 중" : "작가 팔로우"}
                  </FavoriteButton>
                )}
              </>
            )}
            {isAuthor && (
              <>
                <ControlButton onClick={openEditModal}>에피소드 편집</ControlButton>
                <ControlButton $danger onClick={toggleThreadStatus}>
                  {thread.ended ? "연재 재개" : "연재 종료"}
                </ControlButton>
              </>
            )}
          </AuthorControls>
        </ChapterHeader>

        <ContentSheet>
          <MainStory>
            {mainChapter ? renderContent(mainChapter.content) : "본문 내용이 없습니다."}
          </MainStory>

          {comments.length > 0 && (
            <>
              <Separator />
              <AuthorNotesHeader>💬 작가의 말 / 댓글</AuthorNotesHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {comments.map((comm) => (
                  <ResponseCard
                    key={comm.id}
                    response={comm as any}
                    threadId={thread.id}
                    boardId={thread.boardId}
                    prerenderedContent={renderContent(comm.content)}
                    headerActions={
                      (currentUserId === comm.userId || canManageResponses) && (
                        <ControlButton onClick={() => handleDeleteResponse(comm.id)} style={{ padding: "0.2rem 0.6rem" }}>
                          삭제
                        </ControlButton>
                      )
                    }
                  />
                ))}
              </div>
            </>
          )}
        </ContentSheet>

        {isLoggedIn && !thread.ended && (
          <div style={{ marginTop: "4rem", width: "100%", maxWidth: "180rem" }}>
            <ResponseFormSection
              thread={{
                id: thread.id,
                boardId: thread.boardId,
                title: thread.title,
                ended: thread.ended,
              }}
              defaultUsername={defaultUsername}
              tripcodeSalt={tripcodeSalt}
              responseOptions={responseOptions}
              toggleOption={toggleOption}
              isGlobalActive={isGlobalActive}
              hasThreadOverride={hasThreadOverride}
              resetAllThreadOptions={resetAllThreadOptions}
              realtimeEnabled={realtimeEnabled}
              storageEnabled={storageEnabled}
              uploadMaxSize={uploadMaxSize}
              currentLastSeq={currentLastSeq}
              anonId={anonId}
              labels={labels}
              alwaysBottomRef={alwaysBottomRef}
              isAtBottomRef={isAtBottomRef}
              pageEndRef={pageEndRef}
              onSubmitSuccess={handleRefresh}
              isAuthor={isAuthor}
            />
          </div>
        )}

        {isEditModalOpen && (
          <ModalOverlay onClick={() => setEditModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalTitle>에피소드 편집</ModalTitle>
              <ModalField>
                <Label>제목</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </ModalField>
              <ModalField>
                <Label>본문 내용</Label>
                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
              </ModalField>
              <ModalActions>
                <ControlButton onClick={() => setEditModalOpen(false)}>취소</ControlButton>
                <ControlButton $danger onClick={handleEditSubmit}>저장하기</ControlButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}

        <div ref={pageEndRef} />

        <NavigationBar>
          {prevThreadId ? (
            <NavButton onClick={() => router.push(`/trace/${thread.boardId}/${prevThreadId}/recent`)}>
              ◀ 이전 화
            </NavButton>
          ) : (
            <NavButton disabled>이전 화 없음</NavButton>
          )}

          <NavButton onClick={() => router.push(`/index/${thread.boardId}`)}>
            목차 보기
          </NavButton>

          {nextThreadId ? (
            <NavButton $primary onClick={() => router.push(`/trace/${thread.boardId}/${nextThreadId}/recent`)}>
              다음 화 ▶
            </NavButton>
          ) : (
            <NavButton disabled>다음 화 없음</NavButton>
          )}

          <NavButton onClick={() => router.push("/")}>
            메인으로
          </NavButton>
        </NavigationBar>
      </Container>
    </PageLayout>
  );
}
