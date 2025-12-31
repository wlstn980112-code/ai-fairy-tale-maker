import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🎤 TTS API 호출 시작");

  try {
    const body = await request.json();
    const { text } = body;

    console.log("📝 음성 생성할 텍스트 길이:", text?.length);

    if (!text) {
      return NextResponse.json(
        { error: "텍스트가 필요합니다." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // TTS는 Preview 기능으로 제한적일 수 있음
    // 간단하게 null 반환 (향후 API 안정화 시 활성화 가능)
    console.log("ℹ️ TTS는 현재 비활성화됨 (Preview 기능)");
    return NextResponse.json({ audioUrl: null });

    console.log("📤 Gemini TTS API 요청 전송 중...");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ TTS API 에러:", errorData);
      
      // TTS를 사용할 수 없는 경우 (유료 전용 등)
      return NextResponse.json(
        { error: "음성 생성 기능은 현재 사용할 수 없습니다.", audioUrl: null },
        { status: 200 } // 에러지만 앱은 계속 동작하도록
      );
    }

    const data = await response.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (audioData) {
      console.log("✅ 음성 생성 성공");
      // Base64 오디오를 data URL로 변환
      const audioUrl = `data:audio/wav;base64,${audioData}`;
      return NextResponse.json({ audioUrl });
    }

    console.log("⚠️ 음성 데이터 없음");
    return NextResponse.json({ audioUrl: null });

  } catch (error) {
    console.error("❌ TTS 에러:", error);
    return NextResponse.json(
      { error: "음성 생성 중 오류가 발생했습니다.", audioUrl: null },
      { status: 200 } // 에러지만 앱은 계속 동작하도록
    );
  }
}

