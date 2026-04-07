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

const FormSubtitle = styled.p`
  font-size: 1.5rem;
  color: ${(props) => props.theme.textSecondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  background: ${(props) => props.theme.surface};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
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
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    background: ${(props) => props.theme.surface};
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
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
    background: ${(props) => props.theme.surface};
  }
`;

const HelperText = styled.span`
  font-size: 1.2rem;
  color: ${(props) => props.theme.textMuted};
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
  transition: opacity 0.2s;
  margin-top: 1.2rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 1.2rem;
  background: #ef444420;
  border: 1px solid #ef4444;
  border-radius: 0.8rem;
  color: #ef4444;
  font-size: 1.4rem;
  margin-bottom: 1.6rem;
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

export default function CreateNovelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    coverImage: "",
  });
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

      const res = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, coverImage: finalCoverImage }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMsg = typeof data.error === "object" ? JSON.stringify(data.error) : data.error;
        throw new Error(errorMsg || "소설 생성 중 오류가 발생했습니다.");
      }

      const novel = await res.json();
      router.push(`/index/${novel.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <PageLayout title="새 소설 연재" isLoggedIn canAccessAdmin={false} authLabels={{ login: "", logout: "" }}>
      <Container>
        <FormHeader>
          <FormTitle>✍️ 새 소설 연재 시작하기</FormTitle>
          <FormSubtitle>당신만의 새로운 이야기를 세상에 들려주세요.</FormSubtitle>
        </FormHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>소설 제목</Label>
            <Input
              type="text"
              required
              placeholder="예: 참치가 살아나는 날"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
            />
          </FormGroup>

          <FormGroup>
            <Label>소설 고유 ID (ID/Slug)</Label>
            <Input
              type="text"
              required
              placeholder="예: tuna-rising"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
              maxLength={50}
            />
            <HelperText>소설의 URL 주소로 사용됩니다 (영문 소문자, 숫자, 하이픈만 가능)</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>시놉시스 / 설명</Label>
            <Textarea
              placeholder="소설의 중심 줄거리와 매력 포인트를 설명해주세요."
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
            {loading ? "작품 생성 중..." : "🚀 소설 연재 시작하기"}
          </SubmitButton>
        </Form>
      </Container>
    </PageLayout>
  );
}
