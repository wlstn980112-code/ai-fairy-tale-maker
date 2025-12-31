import { NextRequest, NextResponse } from "next/server";
import {
  GenerateStoryRequest,
  StoryResponse,
  StoryMode,
  Scene,
} from "@/app/types";

// 이미지 생성 함수 - Imagen은 유료 전용이므로 비활성화
async function generateImage(prompt: string): Promise<string | null> {
  // Imagen API는 유료 사용자만 접근 가능
  // 프롬프트는 제공되므로 사용자가 원하는 서비스에서 직접 생성 가능
  console.log("ℹ️ 이미지 프롬프트 제공 (Imagen은 유료 전용)");
  return null;
}

export async function POST(request: NextRequest) {
  console.log("🚀 API 호출 시작: /api/generate-story");

  try {
    const body: GenerateStoryRequest = await request.json();
    const { image, userInput, mode } = body;

    console.log("📥 요청 데이터:", {
      hasImage: !!image,
      inputLength: userInput?.length,
      mode,
    });

    // 입력 검증
    if (!userInput) {
      console.error("❌ 사용자 입력 누락");
      return NextResponse.json(
        { error: "이야기 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ Gemini API 키 누락");
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 동화 생성 프롬프트 구성
    const systemPrompt = getSystemPrompt(mode);
    const userPrompt = getUserPrompt(userInput, mode, !!image);

    console.log(
      `🤖 ${
        image ? "Gemini Flash (이미지 포함)" : "Gemini Flash"
      } API 호출 중...`
    );

    // REST API로 직접 호출 (무료 티어에서 사용 가능한 최신 안정 버전)
    const modelName = "gemini-flash-latest";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const requestBody: any = {
      contents: [
        {
          parts: [] as any[],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8000, // 긴 이야기를 위해 토큰 수 증가
        topK: 40,
        topP: 0.95,
      },
    };

    // 텍스트 추가
    requestBody.contents[0].parts.push({
      text: `${systemPrompt}\n\n${userPrompt}`,
    });

    console.log("📤 요청 전송 중... 모델:", modelName);

    // 이미지가 있으면 추가
    if (image) {
      const imageData = image.split(",")[1]; // base64 데이터 추출
      requestBody.contents[0].parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData,
        },
      });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Gemini API 에러:", errorData);
      throw new Error(
        `Gemini API 오류: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Gemini 응답 수신");

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("❌ Gemini 응답 내용 없음");
      throw new Error("동화 생성에 실패했습니다.");
    }

    console.log("📝 응답 파싱 중...");

    // JSON 응답 파싱
    const storyData = parseStoryResponse(content, mode);

    console.log("✅ 동화 생성 완료:", {
      title: storyData.title,
      scenesCount: storyData.scenes.length,
    });

    // 이미지는 프롬프트로만 제공 (Imagen은 유료 전용)
    console.log("ℹ️ 이미지 프롬프트 제공 완료");

    return NextResponse.json(storyData);
  } catch (error) {
    console.error("❌ API 에러:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// 시스템 프롬프트 생성
function getSystemPrompt(mode?: StoryMode): string {
  return `당신은 '우리 아이 맞춤형 AI 동화 작가'입니다. 4~7세 아이와 부모님을 위한 따뜻하고 교육적인 동화를 만듭니다.

**응답 형식 (JSON):**
\`\`\`json
{
  "title": "동화 제목",
  "scenes": [
    {
      "description": "장면 설명 (한국어, 부드러운 구어체)",
      "imagePrompt": "Detailed English prompt for image generation, maintaining child's appearance from photo"
    }
  ],
  "growthPoint": "엄마를 위한 한 줄 성장 포인트",
  "detectedMode": "daily|creative|hero"
}
\`\`\`

**동화 모드:**
1. **daily (데일리 성장 일기)**: 실제 사건을 기록, 교육적 가치 부여
2. **creative (창작 동화)**: "옛날 옛적에"로 시작하는 판타지, 기승전결 명확
3. **hero (사진 속 주인공)**: 아이가 영웅/요정이 되는 이야기, 외양 묘사 포함

**작성 가이드:**
- 언어: 따뜻하고 부드러운 한국어 구어체
- 구성: 10~15개 장면 (길고 풍성한 이야기)
- 각 장면: 3-4 문단으로 자세하게
- 전체 이야기: 시작-발전-절정-결말이 명확한 완결된 스토리
- Image Prompt: 영문, 상세, 아이 외양 일관성 유지
- 성장 포인트: 교육적 가치를 한 줄로 요약

**중요:** 이야기가 너무 짧으면 안됩니다. 최소 10개 장면으로 구성하여 풍성하고 완성도 높은 동화를 만드세요.

**중요:** 반드시 유효한 JSON 형식으로만 응답하세요.`;
}

// 사용자 프롬프트 생성
function getUserPrompt(
  userInput: string,
  mode?: StoryMode,
  hasImage: boolean = false
): string {
  const modeGuide = mode
    ? `\n\n**선택된 모드: ${mode}** - 이 모드에 맞춰 동화를 만들어주세요.`
    : "\n\n입력 내용을 분석하여 가장 적합한 모드를 자동으로 선택해주세요.";

  if (hasImage) {
    return `사진 속 아이를 주인공으로 다음 내용의 동화를 만들어주세요:

"${userInput}"
${modeGuide}

사진 속 아이의 특징(머리 색깔, 옷차림, 나이대 등)을 자세히 관찰하고, 이를 Image Prompt에 일관되게 반영해주세요.

**중요:** 반드시 10~15개의 장면으로 구성된 길고 완성도 높은 동화를 만드세요. 각 장면은 3-4 문단으로 자세하게 작성하세요.

반드시 JSON 형식으로만 응답해주세요.`;
  } else {
    return `다음 내용을 바탕으로 4~7세 아이를 위한 풍성한 동화를 만들어주세요:

"${userInput}"
${modeGuide}

사진이 없으므로 일반적인 귀여운 아이 캐릭터를 상상하여 동화를 만들어주세요.
Image Prompt에는 "a cute young child (4-7 years old)"를 기본으로 하여 상세한 영문 프롬프트를 작성해주세요.

**중요:** 반드시 10~15개의 장면으로 구성된 길고 완성도 높은 동화를 만드세요. 각 장면은 3-4 문단으로 자세하게 작성하고, 시작-발전-절정-결말이 명확한 완결된 이야기를 만드세요.

반드시 JSON 형식으로만 응답해주세요.`;
  }
}

// Gemini 응답 파싱
function parseStoryResponse(
  content: string,
  requestedMode?: StoryMode
): StoryResponse {
  try {
    console.log("📝 원본 응답 확인:", content.substring(0, 200));

    // JSON 블록 추출 시도 (여러 패턴 지원)
    let jsonString = content;

    // 1. ```json ``` 블록 제거
    const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      jsonString = jsonBlockMatch[1];
      console.log("✅ JSON 블록 추출 성공");
    }

    // 2. ``` ``` 블록 제거 (언어 지정 없는 경우)
    const codeBlockMatch = jsonString.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
      console.log("✅ 코드 블록 추출 성공");
    }

    // 3. JSON 객체만 추출
    const jsonObjectMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonString = jsonObjectMatch[0];
    }

    console.log("📝 파싱할 JSON 길이:", jsonString.length);

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("❌ JSON 파싱 1차 실패, 수정 시도 중...");

      // JSON이 잘린 경우 복구 시도
      // 마지막 완전한 scene까지만 파싱
      const lastCompleteScene = jsonString.lastIndexOf("    }");
      if (lastCompleteScene > 0) {
        const fixedJson =
          jsonString.substring(0, lastCompleteScene + 5) +
          '\n  ],\n  "growthPoint": "오늘도 우리 아이는 한 뼘 더 자랐어요.",\n  "detectedMode": "' +
          (requestedMode || "creative") +
          '"\n}';
        console.log("🔧 JSON 복구 시도");
        parsed = JSON.parse(fixedJson);
      } else {
        throw parseError;
      }
    }

    console.log("✅ JSON 파싱 성공, 장면 수:", parsed.scenes?.length);

    // 필수 필드 검증
    if (
      !parsed.title ||
      !parsed.scenes ||
      !Array.isArray(parsed.scenes) ||
      !parsed.growthPoint
    ) {
      throw new Error("필수 필드가 누락되었습니다.");
    }

    // 각 장면 검증
    parsed.scenes.forEach((scene: any, index: number) => {
      if (!scene.description || !scene.imagePrompt) {
        throw new Error(`장면 ${index + 1}에 필수 필드가 누락되었습니다.`);
      }
    });

    return {
      title: parsed.title,
      scenes: parsed.scenes,
      growthPoint: parsed.growthPoint,
      detectedMode: parsed.detectedMode || requestedMode || "daily",
    };
  } catch (error) {
    console.error("❌ JSON 파싱 실패:", error);
    console.error("원본 응답:", content);

    // 파싱 실패 시 기본 응답 생성
    return {
      title: "우리 아이의 특별한 하루",
      scenes: [
        {
          description: content.substring(0, 500),
          imagePrompt:
            "A heartwarming children's book illustration of a young child",
        },
      ],
      growthPoint: "오늘도 우리 아이는 한 뼘 더 자랐어요.",
      detectedMode: requestedMode || "daily",
    };
  }
}
