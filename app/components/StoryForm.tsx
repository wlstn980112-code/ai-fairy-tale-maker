'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { StoryMode } from '../types';

interface StoryFormProps {
  onSubmit: (userInput: string, mode: StoryMode) => void;
  isLoading: boolean;
  onImageUpload: (imageDataUrl: string) => void;
  currentImage: string | null;
}

export default function StoryForm({ onSubmit, isLoading, onImageUpload, currentImage }: StoryFormProps) {
  const [userInput, setUserInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<StoryMode>('daily');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) {
      alert('이야기 내용을 입력해주세요!');
      return;
    }

    console.log('📝 폼 제출:', { mode: selectedMode, inputLength: userInput.length });
    onSubmit(userInput, selectedMode);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📷 파일 선택됨:', { name: file.name, size: file.size, type: file.type });

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하여야 합니다.');
      return;
    }

    // FileReader로 이미지를 base64로 변환
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      console.log('✅ 이미지 변환 완료');
      onImageUpload(result);
    };
    reader.onerror = () => {
      console.error('❌ 이미지 읽기 실패');
      alert('이미지를 읽는데 실패했습니다.');
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const modes = [
    {
      id: 'daily' as StoryMode,
      icon: '📔',
      title: '데일리 성장 일기',
      description: '오늘 있었던 일을 기록해요',
      example: '예: 오늘 친구에게 사과를 나눠줬어요'
    },
    {
      id: 'creative' as StoryMode,
      icon: '✨',
      title: '창작 동화',
      description: '상상의 나래를 펼쳐요',
      example: '예: 숲 속 모험 이야기를 만들어주세요'
    },
    {
      id: 'hero' as StoryMode,
      icon: '🦸',
      title: '사진 속 주인공',
      description: '아이가 영웅이 되는 이야기',
      example: '예: 용감한 기사가 되어 공주를 구해요'
    }
  ];

  return (
    <div className="fairy-card">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        ✍️ 동화 만들기
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 모드 선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            동화 모드를 선택해주세요
          </label>
          <div className="grid grid-cols-1 gap-3">
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  console.log('🎯 모드 선택:', mode.id);
                  setSelectedMode(mode.id);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  selectedMode === mode.id
                    ? 'border-pink-500 bg-pink-50 shadow-md'
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{mode.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{mode.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{mode.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{mode.example}</p>
                  </div>
                  {selectedMode === mode.id && (
                    <span className="text-pink-500 text-xl">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 텍스트 입력 */}
        <div>
          <label htmlFor="userInput" className="block text-sm font-semibold text-gray-700 mb-2">
            어떤 이야기를 만들까요?
          </label>
          <textarea
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
            placeholder="아이의 이야기를 자유롭게 적어주세요... (사진이 있으면 더 특별한 동화가 만들어져요!)"
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {userInput.length} / 500자
          </p>
        </div>

        {/* 사진 첨부 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            📸 아이 사진 첨부 <span className="text-xs text-gray-400">(선택사항)</span>
          </label>
          
          {currentImage ? (
            <div className="space-y-3">
              <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-pink-300">
                <Image
                  src={currentImage}
                  alt="업로드된 아이 사진"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleImageClick}
                className="w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold transition-colors text-sm"
              >
                🔄 다른 사진 선택하기
              </button>
            </div>
          ) : (
            <div 
              onClick={handleImageClick}
              className="w-full h-48 border-2 border-dashed border-pink-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50/30 transition-colors"
            >
              <div className="text-5xl mb-3">📷</div>
              <p className="text-gray-600 font-semibold">클릭하여 사진을 선택하세요</p>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG (최대 10MB)</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="fairy-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
              동화 만드는 중...
            </span>
          ) : (
            '🎨 동화 만들기'
          )}
        </button>
      </form>

      <div className="mt-4 p-4 bg-fairy-yellow rounded-xl border border-yellow-300">
        <p className="text-sm text-gray-600">
          💡 <strong>팁:</strong> 사진 없이도 동화를 만들 수 있어요! 하지만 아이의 얼굴이 잘 보이는 사진을 함께 올리면 훨씬 더 특별하고 맞춤형 동화가 만들어져요!
        </p>
      </div>
    </div>
  );
}

