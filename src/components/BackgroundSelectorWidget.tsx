"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

type BackgroundImage = {
  id: string;
  src: string;
  alt: string;
};

const backgroundImages: BackgroundImage[] = [
  {
    id: 'default',
    src: '',
    alt: '기본 배경'
  },
  {
    id: 'designer-1',
    src: '/skin/Designer-1.jpeg',
    alt: '디자이너 배경 1'
  },
  {
    id: 'designer-2',
    src: '/skin/Designer-2.jpeg',
    alt: '디자이너 배경 2'
  }
  ,
  {
    id: 'designer-3',
    src: '/skin/Designer-4.png',
    alt: '디자이너 배경 3'
  }
  ,
  {
    id: 'designer-4',
    src: '/skin/Designer-5.png',
    alt: '디자이너 배경 4'
  }
];

export default function BackgroundSelectorWidget() {
  const [selectedBackground, setSelectedBackground] = useState<string>('default');

  useEffect(() => {
    // 로컬 스토리지에서 저장된 배경 이미지 설정 불러오기
    const savedBackground = localStorage.getItem('selectedBackground');
    if (savedBackground) {
      setSelectedBackground(savedBackground);
      applyBackground(savedBackground);
    }
  }, []);

  const applyBackground = (id: string) => {
    const selected = backgroundImages.find(bg => bg.id === id);
    if (selected) {
      if (selected.id === 'default') {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = '';
      } else {
        document.body.style.backgroundImage = `url(${selected.src})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
      }
      localStorage.setItem('selectedBackground', id);
    }
  };

  const handleBackgroundChange = (id: string) => {
    setSelectedBackground(id);
    applyBackground(id);
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl">
      <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[90px] flex flex-col justify-between">
        <h3 className="text-2xl font-bold mb-4 select-none text-center flex justify-center items-center gap-2 cursor-move">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">배경</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-400 to-orange-400">이미지</span>
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {backgroundImages.map((bg) => (
            <div
              key={bg.id}
              className={`relative cursor-pointer border-2 rounded-md overflow-hidden h-16 
                ${selectedBackground === bg.id ? 'border-blue-500' : 'border-transparent'}`}
              onClick={() => handleBackgroundChange(bg.id)}
            >
              {bg.id === 'default' ? (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs">기본</span>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={bg.src}
                    alt={bg.alt}
                    fill
                    sizes="100px"
                    priority
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 