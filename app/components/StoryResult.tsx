"use client";

import { StoryResponse } from "../types";
import { useState } from "react";
import Image from "next/image";
import StoryBookView from "./StoryBookView";

interface StoryResultProps {
  story: StoryResponse;
}

export default function StoryResult({ story }: StoryResultProps) {
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(
    new Set([0])
  );
  const [showBookView, setShowBookView] = useState(false);

  const toggleScene = (index: number) => {
    const newExpanded = new Set(expandedScenes);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedScenes(newExpanded);
  };

  const getModeInfo = (mode: string) => {
    switch (mode) {
      case "daily":
        return { icon: "📔", name: "데일리 성장 일기" };
      case "creative":
        return { icon: "✨", name: "창작 동화" };
      case "hero":
        return { icon: "🦸", name: "사진 속 주인공" };
      default:
        return { icon: "📖", name: "동화" };
    }
  };

  const modeInfo = getModeInfo(story.detectedMode);

  const handleCopyImagePrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    alert(
      "이미지 프롬프트가 복사되었습니다! 🎨\nDALL-E나 Midjourney에서 사용해보세요."
    );
  };

  const handleDownloadStory = () => {
    const content = `
${story.title}
${modeInfo.icon} ${modeInfo.name}

${story.scenes
  .map(
    (scene, i) => `
장면 ${i + 1}
${scene.description}

[Image Prompt]
${scene.imagePrompt}
`
  )
  .join("\n---\n")}

💡 오늘의 성장 포인트
${story.growthPoint}
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${story.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* 동화책 모드 뷰 */}
      {showBookView && (
        <StoryBookView story={story} onClose={() => setShowBookView(false)} />
      )}

      <div className="fairy-card space-y-6 animate-fade-in">
        {/* 헤더 */}
        <div className="text-center border-b-2 border-fairy-pink pb-6">
          <div className="inline-block px-4 py-2 bg-fairy-purple rounded-full text-sm font-semibold text-purple-700 mb-3">
            {modeInfo.icon} {modeInfo.name}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {story.title}
          </h2>

          {/* 동화책 모드 버튼 */}
          <button
            onClick={() => setShowBookView(true)}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            📖 동화책 모드로 보기 ✨
          </button>
        </div>

        {/* 동화 본문 */}
        <div className="space-y-4">
          {story.scenes.map((scene, index) => (
            <div
              key={index}
              className="border-2 border-fairy-blue rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleScene(index)}
                className="w-full p-4 bg-gradient-to-r from-fairy-blue to-fairy-purple hover:from-blue-100 hover:to-purple-100 transition-colors flex items-center justify-between"
              >
                <span className="font-bold text-gray-800">
                  📖 장면 {index + 1}
                </span>
                <span className="text-2xl">
                  {expandedScenes.has(index) ? "▼" : "▶"}
                </span>
              </button>

              {expandedScenes.has(index) && (
                <div className="p-4 bg-white space-y-4">
                  {/* 생성된 이미지 (있는 경우) */}
                  {scene.imageUrl && (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-purple-200 mb-4">
                      <Image
                        src={scene.imageUrl}
                        alt={`장면 ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* 동화 내용 */}
                  <div className="story-text whitespace-pre-wrap">
                    {scene.description}
                  </div>

                  {/* 이미지 프롬프트 */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">
                        🎨 Image Prompt
                      </span>
                      <button
                        onClick={() => handleCopyImagePrompt(scene.imagePrompt)}
                        className="text-xs px-3 py-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                      >
                        📋 복사
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {scene.imagePrompt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 성장 포인트 */}
        <div className="p-6 bg-gradient-to-r from-fairy-yellow to-fairy-peach rounded-2xl border-2 border-orange-200">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            💡 엄마를 위한 오늘의 성장 포인트
          </h3>
          <p className="text-gray-700 leading-relaxed">{story.growthPoint}</p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={handleDownloadStory}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
          >
            💾 동화 저장하기
          </button>
          <button
            onClick={() => {
              // 모든 장면이 펼쳐져 있는지 확인
              const allExpanded = expandedScenes.size === story.scenes.length;

              if (allExpanded) {
                // 전체 닫기
                setExpandedScenes(new Set());
              } else {
                // 전체 펼치기
                setExpandedScenes(new Set(story.scenes.map((_, i) => i)));
              }
            }}
            className="py-3 px-6 bg-gray-200 hover:bg-gray-300 rounded-full font-semibold transition-colors"
          >
            {expandedScenes.size === story.scenes.length
              ? "📕 전체 닫기"
              : "📖 전체 펼치기"}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
          <p>
            이미지 프롬프트를 복사하여 DALL-E, Midjourney 등에서 그림을
            생성해보세요! 🎨
          </p>
        </div>
      </div>
    </>
  );
}
