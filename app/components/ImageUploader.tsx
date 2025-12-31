'use client';

import { useRef, ChangeEvent } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string) => void;
  currentImage: string | null;
}

export default function ImageUploader({ onImageUpload, currentImage }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fairy-card">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📸 아이 사진 업로드
      </h2>
      
      <div className="space-y-4">
        {currentImage ? (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden border-4 border-fairy-purple">
            <Image
              src={currentImage}
              alt="업로드된 아이 사진"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div 
            onClick={handleClick}
            className="w-full h-64 border-4 border-dashed border-fairy-purple rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-fairy-pink/20 transition-colors"
          >
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-gray-600 font-semibold">클릭하여 사진을 선택하세요</p>
            <p className="text-sm text-gray-400 mt-2">JPG, PNG (최대 10MB)</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {currentImage && (
          <button
            onClick={handleClick}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
          >
            🔄 다른 사진 선택하기
          </button>
        )}
      </div>

      <div className="mt-4 p-4 bg-fairy-yellow rounded-xl">
        <p className="text-sm text-gray-600">
          💡 <strong>팁:</strong> 아이의 얼굴이 잘 보이는 사진을 선택하면 더 멋진 동화가 만들어져요!
        </p>
      </div>
    </div>
  );
}


