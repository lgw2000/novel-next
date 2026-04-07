"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import styled from "styled-components";
import { Pagination } from "@/components/Pagination";
import { PageLayout } from "@/components/layout";
import { formatDateTime } from "@/lib/utils/date-formatter";
import { TraceSidebar } from "@/components/sidebar/TraceSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faUserPlus, faHeartCircleCheck, faUserCheck } from "@fortawesome/free-solid-svg-icons";

const Container = styled.div`
  padding: ${(props) => props.theme.containerPadding};
  max-width: ${(props) => props.theme.contentMaxWidth};
  margin: 0 auto;
`;

const SeriesHeader = styled.div`
  display: flex;
  gap: 3.2rem;
  margin-bottom: 4.8rem;
  background: ${(props) => props.theme.surface};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 2.4rem;
  padding: 3.2rem;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2.4rem;
  }
`;

const LargeCover = styled.div`
  flex-shrink: 0;
  width: 24rem;
  height: 32rem;
  border-radius: 1.6rem;
  overflow: hidden;
  background: ${(props) => props.theme.surfaceHover};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 10rem;
`;

const SeriesInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SeriesTitle = styled.h1`
  font-size: 3.6rem;
  font-weight: 800;
  color: ${(props) => props.theme.textPrimary};
  margin-bottom: 1.6rem;
  line-height: 1.2;
`;

const SeriesDescription = styled.p`
  font-size: 1.6rem;
  line-height: 1.8;
  color: ${(props) => props.theme.textSecondary};
  margin-bottom: 3.2rem;
  white-space: pre-wrap;
`;

const SeriesActions = styled.div`
  display: flex;
  gap: 1.6rem;
  margin-top: auto;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled(Link)<{ $primary?: boolean }>`
  padding: 1.2rem 2.4rem;
  background: ${(props) => props.$primary ? props.theme.primary : props.theme.surfaceHover};
  color: ${(props) => props.$primary ? "white" : props.theme.textPrimary};
  border: 1px solid ${(props) => props.$primary ? "transparent" : props.theme.surfaceBorder};
  border-radius: 1.2rem;
  font-size: 1.6rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
    background: ${(props) => props.$primary ? props.theme.primary : props.theme.surface};
  }
`;

const FavoriteButton = styled.button<{ $active?: boolean; $isAuthor?: boolean }>`
  padding: 1.2rem 2.4rem;
  background: ${(props) => props.$active ? (props.$isAuthor ? "#ff9f43" : "#ff4757") : props.theme.surfaceHover};
  color: ${(props) => props.$active ? "white" : props.theme.textPrimary};
  border: 1px solid ${(props) => props.$active ? "transparent" : props.theme.surfaceBorder};
  border-radius: 1.2rem;
  font-size: 1.6rem;
  font-weight: 700;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  color: ${(props) => props.theme.textPrimary};
  margin-bottom: 2.4rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${(props) => props.theme.surfaceBorder};
  }
`;

const TOC = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const TOCItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.6rem 2.4rem;
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.2rem;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.surfaceHover};
    border-color: ${(props) => props.theme.primary};
    transform: translateX(8px);
  }
`;

const EpisodeNumber = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${(props) => props.theme.primary};
  min-width: 4rem;
`;

const EpisodeTitle = styled.span`
  flex: 1;
  font-size: 1.7rem;
  font-weight: 500;
  color: ${(props) => props.theme.textPrimary};
`;

const EpisodeComments = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${(props) => props.theme.textMuted};
  background: ${(props) => props.theme.surfaceHover};
  padding: 0.2rem 0.6rem;
  border-radius: 99rem;
  opacity: 0.8;
`;

const EpisodeDate = styled.span`
  font-size: 1.3rem;
  color: ${(props) => props.theme.textMuted};
`;

// Simple Modal Styles
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
  max-width: 50rem;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 2rem;
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  padding: 3.2rem;
  box-shadow: 0 32px 64px rgba(0,0,0,0.5);
  overflow: hidden;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.4rem;
  margin: 0 -0.4rem;

  &::-webkit-scrollbar {
    width: 0.4rem;
  }
  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.surfaceBorder};
    border-radius: 99rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 2.4rem;
  color: ${(props) => props.theme.textPrimary};
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: ${(props) => props.theme.textSecondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 1.2rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1rem;
  color: ${(props) => props.theme.textPrimary};
  font-size: 1.5rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.6rem;
  background: ${(props) => props.theme.surfaceHover};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 0.8rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: ${(props) => props.theme.textPrimary};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.4rem;

  &:hover {
    background: ${(props) => props.theme.surface};
    border-color: ${(props) => props.theme.primary};
  }
`;

const CoverPreview = styled.div`
  width: 100%;
  max-width: 24rem;
  margin: 1.2rem auto 0;
  aspect-ratio: 3 / 4;
  border-radius: 1.2rem;
  overflow: hidden;
  background: ${(props) => props.theme.surfaceHover};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  margin-top: 1.2rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: ${(props) => props.theme.textMuted};
`;

const HelperText = styled.span`
  display: block;
  font-size: 1.2rem;
  color: ${(props) => props.theme.textMuted};
  margin-top: 0.8rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 1.2rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1rem;
  color: ${(props) => props.theme.textPrimary};
  font-size: 1.5rem;
  height: 12rem;
  resize: none;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 3.2rem;
`;

const CancelButton = styled.button`
  padding: 1rem 2rem;
  background: transparent;
  color: ${(props) => props.theme.textSecondary};
  border: none;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
`;

const SaveButton = styled.button`
  padding: 1rem 2.4rem;
  background: ${(props) => props.theme.primary};
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

import { useSidebarContext } from "@/components/sidebar/SidebarContext";
import { useEffect } from "react";

interface BoardIndexContentProps {
  boardId: string;
  boardName: string;
  description: string | null;
  coverImage: string | null;
  boards: { id: string; name: string }[];
  isLoggedIn: boolean;
  canAccessAdmin: boolean;
  currentUserId?: string;
  boardOwnerId?: string | null;
  initialIsFavorited?: boolean;
  initialIsAuthorFavorited?: boolean;
  authLabels: { login: string; logout: string };
  threads: {
    id: number;
    title: string;
    username: string;
    ended: boolean;
    top: boolean;
    responseCount: number;
    createdAt: string;
    updatedAt: string;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  search: string;
  labels: {
    createThread: string;
    noThreads: string;
    searchPlaceholder: string;
    searchButton: string;
  };
  boardsTitle: string;
  manualLabel: string;
  customLinks?: { id: string; label: string; url: string }[];
  indexCustomHtml?: string | null;
}

export function BoardIndexContent({
  boardId,
  boardName: initialBoardName,
  description: initialDescription,
  coverImage: initialCoverImage,
  boards,
  isLoggedIn,
  canAccessAdmin,
  currentUserId,
  boardOwnerId,
  initialIsFavorited = false,
  initialIsAuthorFavorited = false,
  authLabels,
  threads,
  pagination,
  search: initialSearch,
  labels,
  customLinks,
  indexCustomHtml,
}: BoardIndexContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const { setMode, setBoardId, setBoardName } = useSidebarContext();

  useEffect(() => {
    setMode("chapters");
    setBoardId(boardId);
    setBoardName(initialBoardName);
    return () => {
      setMode("navigation");
      setBoardId(null);
      setBoardName(null);
    };
  }, [boardId, initialBoardName, setMode, setBoardId, setBoardName]);
  const [search, setSearch] = useState(initialSearch);

  // Favorite States
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isAuthorFavorited, setIsAuthorFavorited] = useState(initialIsAuthorFavorited);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isAuthorLoading, setIsAuthorLoading] = useState(false);

  // Settings Modal State
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editBoardName, setEditBoardName] = useState(initialBoardName);
  const [editDescription, setEditDescription] = useState(initialDescription || "");
  const [editCoverImage, setEditCoverImage] = useState(initialCoverImage || "");
  const [editSlug, setEditSlug] = useState(boardId);
  const [isSaving, setIsSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const isAuthor = currentUserId === boardOwnerId;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    router.push(`/index/${boardId}?${params.toString()}`);
  };

  const getBaseUrl = () => {
    const params = new URLSearchParams();
    if (initialSearch) params.set("search", initialSearch);
    return `/index/${boardId}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      let finalCoverImage = editCoverImage;

      // Upload file first if exists
      if (coverFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", coverFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        if (!uploadRes.ok) throw new Error("이미지 업로드에 실패했습니다.");
        const uploadData = await uploadRes.json();
        finalCoverImage = uploadData.url;
      }

      const res = await fetch(`/api/novels/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editBoardName,
          description: editDescription,
          coverImage: finalCoverImage,
          newId: editSlug !== boardId ? editSlug : undefined,
        }),
      });

      if (res.ok) {
        setSettingsModalOpen(false);
        if (editSlug !== boardId) {
          router.push(`/index/${editSlug}`);
        } else {
          router.refresh();
        }
      } else {
        alert("설정 저장에 실패했습니다.");
      }
    } catch (e) {
      alert("오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // Sort threads (episodes) by ID (chronological order) for the TOC
  const episodes = [...threads].sort((a, b) => a.id - b.id);

  const firstEpisodeId = episodes[0]?.id;
  const latestEpisodeId = episodes[episodes.length - 1]?.id;

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }
    setIsFavoriteLoading(true);
    try {
      const res = await fetch(`/api/novels/${boardId}/favorite`, { method: "POST" });
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
      title={initialBoardName}
      sidebar={<TraceSidebar boardId={boardId} />}
      isLoggedIn={isLoggedIn}
      canAccessAdmin={canAccessAdmin}
      authLabels={authLabels}
    >
      <Container>
        <SeriesHeader>
          <LargeCover>
            {initialCoverImage ? (
              <Image
                src={initialCoverImage}
                alt={initialBoardName}
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              "📖"
            )}
          </LargeCover>
          <SeriesInfo>
            <SeriesTitle>{initialBoardName}</SeriesTitle>
            <SeriesDescription>
              {initialDescription || "등록된 소개글이 없는 신비로운 소설입니다."}
            </SeriesDescription>
            <SeriesActions>
              {firstEpisodeId && (
                <ActionButton href={`/trace/${boardId}/${firstEpisodeId}/recent`} $primary>
                  첫 화부터 읽기
                </ActionButton>
              )}
              {latestEpisodeId && (
                <ActionButton href={`/trace/${boardId}/${latestEpisodeId}/recent`}>
                  최신 화 보기
                </ActionButton>
              )}
              {isAuthor && (
                <ActionButton href={`/index/${boardId}/create`}>
                  + 다음 화 연재하기
                </ActionButton>
              )}
              {isLoggedIn && (
                <>
                  <FavoriteButton 
                    onClick={handleToggleFavorite} 
                    $active={isFavorited}
                    disabled={isFavoriteLoading}
                  >
                    <FontAwesomeIcon icon={isFavorited ? faHeartCircleCheck : faHeart} />
                    {isFavorited ? "선호 작품 등록됨" : "선호 작품 등록"}
                  </FavoriteButton>
                  {boardOwnerId && boardOwnerId !== currentUserId && (
                    <FavoriteButton 
                      onClick={handleToggleAuthorFavorite} 
                      $active={isAuthorFavorited}
                      $isAuthor
                      disabled={isAuthorLoading}
                    >
                      <FontAwesomeIcon icon={isAuthorFavorited ? faUserCheck : faUserPlus} />
                      {isAuthorFavorited ? "선호 작가 등록됨" : "선호 작가 등록"}
                    </FavoriteButton>
                  )}
                </>
              )}
              {isAuthor && (
                <ActionButton as="button" href="#" onClick={(e) => { e.preventDefault(); setSettingsModalOpen(true); }}>
                  ⚙️ 소설 설정
                </ActionButton>
              )}
            </SeriesActions>
          </SeriesInfo>
        </SeriesHeader>

        <SectionTitle>목차 ({pagination.total})</SectionTitle>

        {threads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", opacity: 0.6 }}>
            아직 연재된 에피소드가 없습니다.
          </div>
        ) : (
          <>
            <TOC>
              {episodes.map((ep, idx) => (
                <TOCItem key={ep.id} href={`/trace/${boardId}/${ep.id}/recent`}>
                  <EpisodeTitle>{ep.title}</EpisodeTitle>
                  <EpisodeComments>💬 {ep.responseCount}</EpisodeComments>
                  <EpisodeDate>{formatDateTime(ep.createdAt, locale).split(',')[0]}</EpisodeDate>
                </TOCItem>
              ))}
            </TOC>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              baseUrl={getBaseUrl()}
            />
          </>
        )}

        {isSettingsModalOpen && (
          <ModalOverlay onClick={() => setSettingsModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalTitle>소설 설정</ModalTitle>
              <ModalBody>
                <FormGroup>
                  <Label>소설 제목</Label>
                  <Input value={editBoardName} onChange={(e) => setEditBoardName(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>고유 ID (Slug - URL 주소)</Label>
                  <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="예: my-novel-slug" />
                </FormGroup>
                <FormGroup>
                  <Label>시놉시스 / 설명</Label>
                  <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>소설 커버 이미지</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    <div style={{ display: "flex", gap: "1.2rem", alignItems: "center", marginBottom: "0.8rem" }}>
                      <UploadButton>
                        📁 이미지 파일 선택
                        <FileInput type="file" accept="image/*" onChange={handleFileChange} />
                      </UploadButton>
                      <span style={{ fontSize: "1.3rem", color: "#8899aa" }}>또는 URL 직접 입력</span>
                    </div>
                    <Input 
                      value={editCoverImage} 
                      onChange={(e) => setEditCoverImage(e.target.value)} 
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>
                  {(previewUrl || editCoverImage) && (
                    <CoverPreview>
                      {previewUrl ? (
                        <Image src={previewUrl} alt="Preview" fill style={{ objectFit: "cover" }} unoptimized />
                      ) : editCoverImage ? (
                        <Image src={editCoverImage} alt="URL Preview" fill style={{ objectFit: "cover" }} unoptimized />
                      ) : (
                        "📖"
                      )}
                    </CoverPreview>
                  )}
                  <HelperText>소설의 분위기를 잘 나타내는 이미지를 업로드하거나 URL을 넣어주세요.</HelperText>
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <div style={{ flex: 1 }}>
                  <button 
                    onClick={async () => {
                      if (confirm("정말로 이 소설을 삭제하시겠습니까?")) {
                        try {
                          const res = await fetch(`/api/novels/${boardId}`, { method: "DELETE" });
                          if (res.ok) {
                            alert("소설이 삭제되었습니다.");
                            router.push("/");
                          } else {
                            alert("삭제에 실패했습니다.");
                          }
                        } catch (e) {
                          alert("오류가 발생했습니다.");
                        }
                      }
                    }}
                    style={{ 
                      padding: "1rem 1.6rem", 
                      background: "rgba(255, 71, 87, 0.1)", 
                      color: "#ff4757", 
                      border: "1px solid rgba(255, 71, 87, 0.2)", 
                      borderRadius: "1rem",
                      fontSize: "1.4rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    소설 삭제
                  </button>
                </div>
                <CancelButton onClick={() => setSettingsModalOpen(false)}>취소</CancelButton>
                <SaveButton onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? "저장 중..." : "설정 저장"}
                </SaveButton>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </PageLayout>
  );
}
