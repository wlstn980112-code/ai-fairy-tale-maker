"use client";

import { useState, useEffect, useRef } from "react";
import { StoryResponse } from "../types";

interface StoryBookViewProps {
  story: StoryResponse;
  onClose: () => void;
}

export default function StoryBookView({ story, onClose }: StoryBookViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false); // 클로저 문제 해결용 ref

  console.log("📖 동화책 모드, 현재 페이지:", currentPage, "재생 중:", isPlaying);

  // 페이지 총 개수: 표지 + 장면들 + 마지막 페이지
  const totalPages = story.scenes.length + 2;

  // isPlaying ref 동기화
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // 타이머 클린업 함수
  const clearAutoPlayTimer = () => {
    if (autoPlayTimerRef.current) {
      console.log("⏱️ 타이머 정리");
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  // 다음 페이지
  const nextPage = () => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      console.log("➡️ 다음 페이지로 이동:", currentPage + 1);
      clearAutoPlayTimer();
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsFlipping(false);
      }, 600);
    } else if (currentPage === totalPages - 1) {
      console.log("📖 동화책 끝! 자동 재생 중지");
      setIsPlaying(false);
      clearAutoPlayTimer();
    }
  };

  // 이전 페이지
  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      console.log("⬅️ 이전 페이지로 이동:", currentPage - 1);
      clearAutoPlayTimer();
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  // 현재 페이지 텍스트 가져오기
  const getCurrentPageText = () => {
    if (currentPage === 0) {
      return story.title;
    } else if (currentPage <= story.scenes.length) {
      return story.scenes[currentPage - 1].description;
    } else {
      return story.growthPoint;
    }
  };

  // 현재 페이지 재생 시작
  const playCurrentPage = async () => {
    console.log("▶️ 현재 페이지 재생 시작:", currentPage);
    
    const text = getCurrentPageText();
    setHasAudio(false);
    
    // TTS 시도
    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioUrl && audioRef.current) {
          console.log("🎤 오디오 재생 시작");
          setHasAudio(true);
          audioRef.current.src = data.audioUrl;
          await audioRef.current.play();
          return; // 오디오가 있으면 여기서 종료 (ended 이벤트가 처리)
        }
      }
    } catch (error) {
      console.log("ℹ️ TTS 사용 불가 - 텍스트 자동 넘김 사용");
    }

    // TTS가 없으면 5초 후 자동 넘김
    console.log("⏱️ 5초 타이머 시작");
    clearAutoPlayTimer();
    autoPlayTimerRef.current = setTimeout(() => {
      console.log("⏱️ 5초 경과 - 다음 페이지로");
      if (isPlayingRef.current) {
        nextPage();
      }
    }, 5000);
  };

  // 재생/일시정지 토글
  const togglePlay = () => {
    if (isPlaying) {
      console.log("⏸️ 재생 일시정지");
      setIsPlaying(false);
      audioRef.current?.pause();
      clearAutoPlayTimer();
    } else {
      console.log("▶️ 재생 시작");
      setIsPlaying(true);
      playCurrentPage();
    }
  };

  // 오디오 종료 이벤트 처리
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log("🎵 오디오 종료 - 다음 페이지로");
      if (isPlayingRef.current) {
        nextPage();
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  // 페이지 변경 시 자동 재생 처리
  useEffect(() => {
    if (isPlaying && !isFlipping) {
      console.log("📄 페이지 변경됨 - 자동 재생");
      playCurrentPage();
    }
  }, [currentPage, isPlaying]);

  // 컴포넌트 언마운트 시 클린업
  useEffect(() => {
    return () => {
      console.log("🧹 컴포넌트 정리");
      clearAutoPlayTimer();
      audioRef.current?.pause();
    };
  }, []);

  // 페이지 내용 렌더링
  const renderPage = () => {
    // 표지
    if (currentPage === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-12">
          <div className="text-6xl mb-8 animate-bounce-gentle">📚</div>
          <h1 className="text-5xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            {story.title}
          </h1>
          <div className="mt-8 px-6 py-3 bg-white/80 rounded-full">
            <p className="text-gray-600 font-semibold">
              {story.detectedMode === "daily" && "📔 데일리 성장 일기"}
              {story.detectedMode === "creative" && "✨ 창작 동화"}
              {story.detectedMode === "hero" && "🦸 사진 속 주인공"}
            </p>
          </div>
        </div>
      );
    }

    // 장면들
    if (currentPage <= story.scenes.length) {
      const scene = story.scenes[currentPage - 1];
      return (
        <div className="h-full flex flex-col p-8 pb-32 bg-gradient-to-br from-fairy-yellow to-white overflow-y-auto">
          <div className="flex-1 flex flex-col justify-start">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-purple-200 rounded-full text-purple-800 font-bold">
                장면 {currentPage}
              </span>
            </div>
            
            {/* 이미지 영역 (프롬프트가 있는 경우 표시) */}
            <div className="mb-6 p-6 bg-white/80 rounded-2xl border-2 border-purple-200 shadow-lg">
              <div className="text-center text-gray-400 py-8">
                <div className="text-5xl mb-3">🎨</div>
                <p className="text-sm">이미지 프롬프트:</p>
                <p className="text-xs mt-2 text-gray-500">{scene.imagePrompt.substring(0, 100)}...</p>
              </div>
            </div>

            {/* 동화 텍스트 */}
            <div className="story-text text-xl leading-relaxed whitespace-pre-wrap text-gray-800 bg-white/80 p-6 rounded-xl shadow-sm mb-4">
              {scene.description}
            </div>
          </div>
        </div>
      );
    }

    // 마지막 페이지 (성장 포인트)
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 p-12 pb-32">
        <div className="text-6xl mb-8">💡</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          엄마를 위한 오늘의 성장 포인트
        </h2>
        <p className="text-2xl text-center text-gray-700 leading-relaxed max-w-2xl bg-white/60 p-6 rounded-xl shadow-sm">
          {story.growthPoint}
        </p>
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-lg">끝</p>
          <p className="text-4xl mt-4">🌟</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      {/* 오디오 엘리먼트 */}
      <audio ref={audioRef} className="hidden" />

      {/* 동화책 컨테이너 */}
      <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-gray-800/80 hover:bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl transition-colors"
        >
          ✕
        </button>

        {/* 페이지 넘김 애니메이션 */}
        <div
          className={`h-full transition-all duration-600 ${
            isFlipping ? "scale-95 opacity-50" : "scale-100 opacity-100"
          }`}
        >
          {renderPage()}
        </div>

        {/* 컨트롤 바 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-800/90 to-transparent pt-16 pb-6 px-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* 이전 버튼 */}
            <button
              onClick={prevPage}
              disabled={currentPage === 0 || isFlipping}
              className="w-14 h-14 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-2xl transition-colors shadow-lg z-10"
            >
              ⬅️
            </button>

            {/* 중앙 컨트롤 */}
            <div className="flex items-center gap-4 z-10">
              {/* 재생/일시정지 */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center text-3xl transition-colors shadow-lg"
                title={isPlaying ? "일시정지" : "자동 넘김 시작"}
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>

              {/* 페이지 인디케이터 */}
              <div className="bg-white/95 px-4 py-2 rounded-full shadow-md">
                <span className="font-bold text-gray-800">
                  {currentPage + 1} / {totalPages}
                </span>
              </div>
              
              {/* TTS 상태 표시 */}
              {isPlaying && (
                <div className="text-white text-sm bg-black/70 px-3 py-1 rounded-full shadow-md">
                  {hasAudio ? "🎤 음성 재생 중" : "⏱️ 자동 넘김 중"}
                </div>
              )}
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1 || isFlipping}
              className="w-14 h-14 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-2xl transition-colors shadow-lg z-10"
            >
              ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

