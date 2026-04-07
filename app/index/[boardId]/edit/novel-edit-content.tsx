"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styled from "styled-components";
import { PageLayout } from "@/components/layout";

const Container = styled.div`
  padding: ${(props) => props.theme.containerPadding};
  max-width: 60rem;
  margin: 0 auto;
`;

const FormHeader = styled.div`
  margin-bottom: 3.2rem;
  text-align: center;
`;

const FormTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: ${(props) => props.theme.textPrimary};
  margin-bottom: 0.8rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.6rem;
  padding: 3.2rem;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.label`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${(props) => props.theme.textPrimary};
`;

const Input = styled.input`
  padding: 1.2rem 1.6rem;
  background: ${(props) => props.theme.surfaceHover};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 0.8rem;
  font-size: 1.6rem;
  color: ${(props) => props.theme.textPrimary};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const Textarea = styled.textarea`
  padding: 1.2rem 1.6rem;
  background: ${(props) => props.theme.surfaceHover};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 0.8rem;
  font-size: 1.6rem;
  color: ${(props) => props.theme.textPrimary};
  min-height: 12rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const SubmitButton = styled.button`
  padding: 1.4rem;
  background: ${(props) => props.theme.primary};
  color: white;
  border: none;
  border-radius: 0.8rem;
  font-size: 1.7rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1.2rem;

  &:disabled {
    opacity: 0.5;
  }
`;

const CancelButton = styled.button`
  padding: 1.2rem;
  background: transparent;
  color: ${(props) => props.theme.textSecondary};
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  text-decoration: underline;
`;

const CoverPreview = styled.div`
  width: 100%;
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

  &:hover {
    background: ${(props) => props.theme.surface};
    border-color: ${(props) => props.theme.primary};
  }
`;

const HelperText = styled.span`
  font-size: 1.2rem;
  color: ${(props) => props.theme.textMuted};
`;

const DangerZone = styled.div`
  margin-top: 4.8rem;
  padding: 2.4rem;
  border: 1px solid #ef444440;
  border-radius: 1.2rem;
  background: #ef444408;
`;

const DangerTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 0.8rem;
`;

const DangerText = styled.p`
  font-size: 1.4rem;
  color: ${(props) => props.theme.textSecondary};
  margin-bottom: 2rem;
`;

const DeleteButton = styled.button`
  padding: 1rem 2rem;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 0.8rem;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: white;
  }
`;

interface NovelEditContentProps {
  boardId: string;
  initialData: {
    name: string;
    description: string;
    coverImage: string;
  };
  isLoggedIn: boolean;
  canAccessAdmin: boolean;
  authLabels: { login: string; logout: string };
}

export function NovelEditContent({
  boardId,
  initialData,
  isLoggedIn,
  canAccessAdmin,
  authLabels,
}: NovelEditContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalCoverImage = formData.coverImage;

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

      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, coverImage: finalCoverImage }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMsg = typeof data.error === "object" ? JSON.stringify(data.error) : data.error;
        throw new Error(errorMsg || "수정 중 오류가 발생했습니다.");
      }

      router.push(`/index/${boardId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 소설을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며 모든 데이터가 숨겨집니다.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMsg = typeof data.error === "object" ? JSON.stringify(data.error) : data.error;
        throw new Error(errorMsg || "삭제 중 오류가 발생했습니다.");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="소설 정보 수정"
      isLoggedIn={isLoggedIn}
      canAccessAdmin={canAccessAdmin}
      authLabels={authLabels}
    >
      <Container>
        <FormHeader>
          <FormTitle>⚙️ 소설 정보 수정</FormTitle>
        </FormHeader>

        {error && <div style={{ color: "red", marginBottom: "2rem" }}>{error}</div>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>소설 제목</Label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>시놉시스 / 설명</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={1000}
            />
          </FormGroup>

          <FormGroup>
            <Label>소설 커버 이미지</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
                <UploadButton>
                  📁 이미지 파일 선택
                  <FileInput type="file" accept="image/*" onChange={handleFileChange} />
                </UploadButton>
                <span style={{ fontSize: "1.3rem", color: "#8899aa" }}>또는 직접 URL 입력</span>
              </div>
              <Input
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              />
            </div>
            { (previewUrl || formData.coverImage) && (
              <CoverPreview>
                {previewUrl ? (
                  <Image src={previewUrl} alt="Preview" fill style={{ objectFit: "cover" }} unoptimized />
                ) : formData.coverImage ? (
                  <Image src={formData.coverImage} alt="URL Preview" fill style={{ objectFit: "cover" }} unoptimized />
                ) : (
                  "📖"
                )}
              </CoverPreview>
            )}
            <HelperText>소설의 분위기를 나타내는 커버 이미지를 업로드하거나 URL을 넣어주세요.</HelperText>
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "저장 중..." : "변경사항 저장하기"}
          </SubmitButton>
          
          <CancelButton type="button" onClick={() => router.back()}>
            취소하고 돌아가기
          </CancelButton>
        </Form>

        <DangerZone>
          <DangerTitle>위험 구역</DangerTitle>
          <DangerText>이 소설을 삭제합니다. 삭제된 소설은 목록에서 사라지며 작가 본인만 접근할 수 있는 제한된 상태가 될 수 있습니다.</DangerText>
          <DeleteButton type="button" onClick={handleDelete} disabled={loading}>
            {loading ? "처리 중..." : "🗑️ 소설 삭제하기"}
          </DeleteButton>
        </DangerZone>
      </Container>
    </PageLayout>
  );
}
