"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.6rem;
`;

const Card = styled.div`
  background: ${(props) => props.theme.surface};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 1.2rem;
  padding: 3.2rem 2.4rem;
  width: 100%;
  max-width: 42rem;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  font-size: 2.6rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  text-align: center;
  color: ${(props) => props.theme.textPrimary};
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${(props) => props.theme.textSecondary};
  font-size: 1.4rem;
  margin-bottom: 2.4rem;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.surfaceBorder};
  margin-bottom: 2.4rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: ${(props) => (props.$active ? "700" : "400")};
  color: ${(props) => (props.$active ? props.theme.primary : props.theme.textSecondary)};
  border-bottom: 2px solid ${(props) => (props.$active ? props.theme.primary : "transparent")};
  cursor: pointer;
  transition: all 0.2s;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin-bottom: 2rem;
`;

const Label = styled.label`
  font-size: 1.3rem;
  font-weight: 500;
  color: ${(props) => props.theme.textSecondary};
  margin-bottom: 0.4rem;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.4rem;
  background: ${(props) => props.theme.surfaceHover};
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  border-radius: 0.6rem;
  font-size: 1.5rem;
  color: ${(props) => props.theme.textPrimary};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }

  &::placeholder {
    color: ${(props) => props.theme.textMuted};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.1rem;
  background: ${(props) => props.theme.primary};
  color: white;
  border: none;
  border-radius: 0.6rem;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorBox = styled.p`
  background: ${(props) => props.theme.error}20;
  border: 1px solid ${(props) => props.theme.error}60;
  color: ${(props) => props.theme.error};
  border-radius: 0.6rem;
  padding: 1rem 1.4rem;
  font-size: 1.4rem;
  margin-bottom: 1.6rem;
`;

const SuccessBox = styled.p`
  background: ${(props) => props.theme.success}20;
  border: 1px solid ${(props) => props.theme.success}60;
  color: ${(props) => props.theme.success};
  border-radius: 0.6rem;
  padding: 1rem 1.4rem;
  font-size: 1.4rem;
  margin-bottom: 1.6rem;
`;

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (status === "loading") {
    return <Container><Card><Title>로딩 중...</Title></Card></Container>;
  }

  if (session) {
    return (
      <Container>
        <Card>
          <Title>👋 환영합니다</Title>
          <Subtitle>{session.user?.name || session.user?.email}</Subtitle>
          <SubmitButton onClick={() => signOut({ callbackUrl: "/" })}>
            로그아웃
          </SubmitButton>
        </Card>
      </Container>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("이메일 또는 비밀번호를 확인해주세요.");
    } else {
      router.push(callbackUrl);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
      } else {
        setSuccess("회원가입 완료! 로그인해주세요.");
        setTab("login");
        setPassword("");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>📖 소설 플랫폼</Title>
        <Subtitle>
          {tab === "login" ? "계정에 로그인하세요" : "새 계정을 만드세요"}
        </Subtitle>

        <Tabs>
          <Tab $active={tab === "login"} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>
            로그인
          </Tab>
          <Tab $active={tab === "signup"} onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}>
            회원가입
          </Tab>
        </Tabs>

        {error && <ErrorBox>{error}</ErrorBox>}
        {success && <SuccessBox>{success}</SuccessBox>}

        {tab === "login" ? (
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </FieldGroup>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </SubmitButton>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <FieldGroup>
              <div>
                <Label htmlFor="signup-name">닉네임</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="표시될 이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="signup-email">이메일</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="signup-password">비밀번호 (6자 이상)</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="비밀번호 설정"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </FieldGroup>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? "가입 중..." : "회원가입"}
            </SubmitButton>
          </form>
        )}
      </Card>
    </Container>
  );
}
