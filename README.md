# Novel-Next

> [!WARNING]
> 이 프로젝트는 현재 개발 중입니다. 보안 및 안정성을 보장하지 않으므로 프로덕션 환경에서 사용 시 주의가 필요합니다.

Next.js 15+ 기반의 AA(ascii art) 웹소설 연재 및 열람 플랫폼입니다. [OpenChamchiJS](https://github.com/tunaground/OpenChamchiJS)를 사용하여 바이브 코딩으로 만들었습니다.

Next.js 15+ 기반의 AA(ascii art) 웹소설 연재 및 열람 플랫폼입니다. OpenChamchiJS의 백엔드 아키텍처를 계승하여 빠르고 안정적인 서비스 환경을 제공합니다.


## 주요 기능

- **웹소설 연재** - 작가별 소설 생성, 회차 관리 및 연재 시스템
- **몰입형 뷰어** - 독자를 위한 깨끗하고 세련된 독서 인터페이스
- **실시간 상호작용** - 회차별 실시간 댓글 및 반응 (Ably WebSocket)
- **미디어 관리** - 소설 표지 및 삽화 업로드 (Supabase Storage)
- **개인화 서비스** - 선호 소설 및 작가 팔로우 기능
- **관리자 도구** - 작품 승인, 범주 관리, 사용자 역할 제어 (RBAC)
- **다국어 지원** - 한국어, 영어, 일본어 기본 지원
- **다크 모드** - 눈이 편안한 라이트/다크 테마 전환

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (Dev) / PostgreSQL (Prod) via Prisma
- **Auth**: Next-Auth (Google OAuth, Credentials)
- **Styling**: styled-components
- **Realtime**: Ably
- **Storage**: Supabase Storage
- **State**: Zustand

## 시작하기 (로컬 개발)

### 요구사항

- Node.js 20+
- SQLite (기본) 또는 PostgreSQL

### 설치 및 실행

```bash
# 1. 저장소 클론

git clone https://github.com/lgw2000/novel-next.git

cd novel-next

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 내의 DATABASE_URL, NEXTAUTH_SECRET 등을 설정하세요.

# 4. 데이터베이스 및 Prisma 설정
npx prisma generate
npx prisma migrate dev --name init

# 5. 개발 서버 시작
npm run dev
```

## 배포 가이드 (Vercel)

1. Vercel 사이트에서 프로젝트 가져오기.
2. PostgreSQL (Vercel Postgres 등) 연결.
3. Google OAuth 및 Supabase/Ably API 키 환경 변수 등록.
4. `DATABASE_URL`, `DIRECT_URL` 등 필수 변수 확인.
5. Deploy 클릭.

## 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # 코드 린팅
npm test         # 테스트 실행
```

## 라이센스

MIT License
