# 🌟 우리 아이 맞춤형 AI 동화 작가

아이의 사진과 이야기를 담은 특별한 동화를 AI가 만들어드립니다!

## ✨ 주요 기능

### 📚 3가지 동화 모드

1. **📔 데일리 성장 일기 모드**
   - 오늘 있었던 구체적인 사건 기록
   - 실제 행동을 칭찬하고 교육적 가치 부여
   - 예: "오늘 친구에게 사과를 나눠줬어요"

2. **✨ 창작 동화 모드**
   - "옛날 옛적에"로 시작하는 판타지 스토리
   - 기승전결이 뚜렷한 상상의 이야기
   - 예: "숲 속 모험 이야기를 만들어주세요"

3. **🦸 사진 속 주인공 모드**
   - 아이의 외양(옷차림, 표정)을 묘사
   - 아이가 영웅이나 요정이 되는 이야기
   - 예: "용감한 기사가 되어 공주를 구해요"

### 🎨 특별한 기능들

- **AI 사진 분석**: GPT-4 Vision으로 아이의 특징 자동 인식
- **맞춤형 동화 생성**: 4~7세 대상, 따뜻한 구어체
- **이미지 프롬프트 제공**: DALL-E, Midjourney 등에서 사용 가능한 영문 프롬프트
- **성장 포인트**: 부모님을 위한 교육적 인사이트
- **동화 저장**: 텍스트 파일로 다운로드 가능

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn
- Google Gemini API 키 (무료로 사용 가능!)

### 설치 방법

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 환경 변수 설정
# .env.local 파일을 열어 OpenAI API 키를 입력하세요
```

### Google Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "API 키 만들기" 클릭
4. 생성된 키를 복사하여 `.env.local` 파일에 입력:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 실행

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 접속
# http://localhost:3000
```

## 📖 사용 방법

### 1단계: 사진 업로드
- 아이의 얼굴이 잘 보이는 사진을 선택하세요
- JPG, PNG 형식 (최대 10MB)

### 2단계: 동화 모드 선택
- 데일리 성장 일기 / 창작 동화 / 사진 속 주인공 중 선택

### 3단계: 이야기 입력
- 만들고 싶은 동화의 내용을 자유롭게 작성하세요
- 최대 500자

### 4단계: 동화 생성
- "동화 만들기" 버튼을 클릭하고 잠시 기다리세요
- AI가 4~5개 장면으로 구성된 동화를 만들어드립니다

### 5단계: 결과 확인
- 생성된 동화를 읽고 저장하세요
- 이미지 프롬프트를 복사하여 그림 생성 AI에서 활용하세요

## 🎨 이미지 프롬프트 활용

각 장면마다 제공되는 Image Prompt를 다음 서비스에서 사용할 수 있습니다:

- **DALL-E 3**: [ChatGPT Plus](https://chat.openai.com) 또는 [API](https://platform.openai.com/docs/guides/images)
- **Midjourney**: [Discord](https://www.midjourney.com)
- **Stable Diffusion**: [DreamStudio](https://beta.dreamstudio.ai)
- **Leonardo AI**: [leonardo.ai](https://leonardo.ai)

### 사용 예시

```
복사된 프롬프트:
"A warm children's book illustration of a 5-year-old Korean boy with short black hair, wearing a blue t-shirt, sharing an apple with his friend in a sunny playground, soft pastel colors, gentle lighting, heartwarming scene"

→ DALL-E나 Midjourney에 입력하여 동화 삽화 생성
```

## 🛠️ 기술 스택

- **프론트엔드**: Next.js 15 (App Router), TypeScript, React
- **스타일링**: Tailwind CSS
- **AI**: Google Gemini 1.5 Flash API
- **이미지 처리**: Base64 인코딩

## 📂 프로젝트 구조

```
ai-fairy-tale-maker/
├── app/
│   ├── api/
│   │   └── generate-story/
│   │       └── route.ts          # 동화 생성 API
│   ├── components/
│   │   ├── ImageUploader.tsx     # 이미지 업로드 컴포넌트
│   │   ├── StoryForm.tsx         # 동화 입력 폼
│   │   └── StoryResult.tsx       # 동화 결과 표시
│   ├── globals.css               # 글로벌 스타일
│   ├── layout.tsx                # 레이아웃
│   ├── page.tsx                  # 메인 페이지
│   └── types.ts                  # TypeScript 타입 정의
├── public/                       # 정적 파일
├── .env.local                    # 환경 변수 (생성 필요)
├── .env.example                  # 환경 변수 예시
├── next.config.js                # Next.js 설정
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
└── package.json                  # 프로젝트 메타데이터
```

## 🔧 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 | ✅ |
| `NEXT_PUBLIC_APP_URL` | 앱 URL (기본: http://localhost:3000) | ❌ |

## 💡 팁과 주의사항

### 사진 선택 팁
- ✅ 아이의 얼굴이 선명하게 보이는 사진
- ✅ 밝은 조명의 사진
- ✅ 정면 또는 측면 사진
- ❌ 너무 어둡거나 흐릿한 사진
- ❌ 여러 명이 함께 있는 사진

### 이야기 입력 팁
- ✅ 구체적인 상황 묘사 ("오늘 공원에서...")
- ✅ 감정 표현 포함 ("기뻐하며...", "용감하게...")
- ✅ 교육적 가치 암시 ("나누기", "용기", "친절")
- ❌ 너무 짧은 입력 (최소 10자 이상 권장)

### 비용 관련
- **Gemini API는 무료 할당량 제공!** 🎉
- 무료: 분당 15회 요청, 일일 1,500회 요청
- 사진 1장 + 동화 생성: **무료!**
- [Gemini API 요금제](https://ai.google.dev/pricing) 확인

## 🐛 문제 해결

### API 키 오류
```
Error: Gemini API 키가 설정되지 않았습니다.
```
→ `.env.local` 파일에 `GEMINI_API_KEY`를 올바르게 입력했는지 확인하세요.

### 이미지 업로드 오류
```
이미지를 읽는데 실패했습니다.
```
→ 이미지 파일 형식(JPG, PNG)과 크기(10MB 이하)를 확인하세요.

### 동화 생성 실패
```
동화 생성에 실패했습니다.
```
→ Gemini API 키가 유효한지와 인터넷 연결을 확인하세요.

## 🔒 개인정보 보호

- 업로드된 사진은 **서버에 저장되지 않습니다**
- 사진은 Base64로 인코딩되어 메모리에서만 처리됩니다
- Google Gemini API로 전송되는 데이터는 [Google AI 개인정보 정책](https://policies.google.com/privacy)에 따라 처리됩니다
- 생성된 동화는 로컬 브라우저에만 저장됩니다

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 PR을 환영합니다!

## 💬 문의

문제가 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ for parents and kids**

© 2024 우리 아이 맞춤형 AI 동화 작가

