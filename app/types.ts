// 동화 모드 타입
export type StoryMode = 'daily' | 'creative' | 'hero';

// 장면 타입
export interface Scene {
  description: string;
  imagePrompt: string;
  imageUrl?: string; // 생성된 이미지 URL (선택사항)
}

// 동화 응답 타입
export interface StoryResponse {
  title: string;
  scenes: Scene[];
  growthPoint: string;
  detectedMode: StoryMode;
}

// API 요청 타입
export interface GenerateStoryRequest {
  image: string;
  userInput: string;
  mode?: StoryMode;
}


