'use client';

import { useState } from 'react';
import StoryForm from './components/StoryForm';
import StoryResult from './components/StoryResult';
import { StoryMode, StoryResponse } from './types';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [storyResult, setStoryResult] = useState<StoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('📚 메인 페이지 렌더링', { hasImage: !!uploadedImage, hasStory: !!storyResult });

  const handleImageUpload = (imageDataUrl: string) => {
    console.log('🖼️ 이미지 업로드 완료', { imageSize: imageDataUrl.length });
    setUploadedImage(imageDataUrl);
    setStoryResult(null); // 새 이미지 업로드 시 기존 결과 초기화
  };

  const handleGenerateStory = async (userInput: string, mode: StoryMode) => {
    console.log('✨ 동화 생성 시작', { mode, inputLength: userInput.length, hasImage: !!uploadedImage });
    setIsLoading(true);
    setStoryResult(null);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          userInput,
          mode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API 오류', error);
        throw new Error(error.error || '동화 생성에 실패했습니다.');
      }

      const data: StoryResponse = await response.json();
      console.log('✅ 동화 생성 완료', { title: data.title, scenesCount: data.scenes.length });
      setStoryResult(data);
    } catch (error) {
      console.error('❌ 동화 생성 중 오류:', error);
      alert(error instanceof Error ? error.message : '동화 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    console.log('🔄 초기화');
    setUploadedImage(null);
    setStoryResult(null);
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="fairy-title mb-4">
            ✨ 우리 아이 맞춤형 AI 동화 작가 ✨
          </h1>
          <p className="text-lg text-gray-600">
            아이의 사진과 이야기를 담은 특별한 동화를 만들어보세요
          </p>
        </header>

        {/* 사용 가이드 - 동화 만들기 전에만 표시 */}
        {!storyResult && (
          <div className="mb-8 animate-fade-in">
            <div className="fairy-card">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">📚✨</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">
                    어떻게 시작하나요?
                  </h3>
                  <p className="text-gray-500">
                    3가지 간단한 단계로 특별한 동화를 만들어보세요!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-fairy-pink rounded-xl">
                    <div className="text-3xl mb-2">1️⃣</div>
                    <h4 className="font-bold text-gray-800 mb-1">모드 선택</h4>
                    <p className="text-sm text-gray-600">
                      데일리 일기, 창작 동화, 사진 속 주인공 중 선택하세요
                    </p>
                  </div>

                  <div className="p-4 bg-fairy-purple rounded-xl">
                    <div className="text-3xl mb-2">2️⃣</div>
                    <h4 className="font-bold text-gray-800 mb-1">이야기 작성</h4>
                    <p className="text-sm text-gray-600">
                      만들고 싶은 동화의 내용을 자유롭게 적어주세요
                    </p>
                  </div>

                  <div className="p-4 bg-fairy-blue rounded-xl">
                    <div className="text-3xl mb-2">3️⃣</div>
                    <h4 className="font-bold text-gray-800 mb-1">사진 첨부 (선택)</h4>
                    <p className="text-sm text-gray-600">
                      아이 사진을 추가하면 더 특별한 맞춤 동화가 만들어져요
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-fairy-yellow rounded-xl border-2 border-yellow-300">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    💡 예시 문구
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700 mb-3">
                    <p>• "오늘 친구에게 사과를 나눠줬어요"</p>
                    <p>• "숲 속 마법의 나무를 찾는 모험"</p>
                    <p>• "우주 비행사가 되어 달나라 여행"</p>
                  </div>
                  <div className="pt-3 border-t border-yellow-300">
                    <p className="text-sm text-gray-700">
                      <strong>💡 팁:</strong> 더 자세한 설명을 작성할수록 더욱 완벽하고 특별한 동화가 만들어져요! 
                      장소, 감정, 상황을 구체적으로 적어보세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 입력 영역 */}
          <div className="space-y-6 animate-slide-up">
            <StoryForm 
              onSubmit={handleGenerateStory}
              isLoading={isLoading}
              onImageUpload={handleImageUpload}
              currentImage={uploadedImage}
            />

            {uploadedImage && (
              <button
                onClick={handleReset}
                className="w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 rounded-full font-semibold transition-colors"
              >
                🔄 처음부터 다시 시작하기
              </button>
            )}
          </div>

          {/* 오른쪽: 결과 영역 */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {isLoading ? (
              <div className="fairy-card h-full flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-6 animate-bounce-gentle">📖</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">
                    동화를 만들고 있어요...
                  </h3>
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p className="text-gray-500 mt-4">
                    잠시만 기다려주세요 💫
                  </p>
                </div>
              </div>
            ) : storyResult ? (
              <StoryResult story={storyResult} />
            ) : (
              <div className="fairy-card h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">✨</div>
                  <p className="text-lg">
                    왼쪽에서 동화를 만들어보세요!<br />
                    <span className="text-sm">결과가 여기에 표시됩니다</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2024 우리 아이 맞춤형 AI 동화 작가 | Made with ❤️ for parents and kids</p>
        </footer>
      </div>
    </main>
  );
}

