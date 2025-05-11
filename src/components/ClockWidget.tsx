"use client";

import { useState, useEffect } from 'react';

export default function ClockWidget() {
  // 초기 상태를 null로 설정하여 클라이언트 사이드에서만 렌더링되도록 함
  const [time, setTime] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // 클라이언트 사이드에서만 초기 시간과 날짜 설정
    setTime(new Date());
    
    // 날짜 형식 설정
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    setCurrentDate(new Date().toLocaleDateString('ko-KR', options));

    // 1초마다 시간 업데이트
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      clearInterval(timer);
    };
  }, []);

  // 시간 형식 설정 (시:분:초)
  const formatTime = () => {
    if (!time) return '--:--:--'; // 초기 렌더링 시 표시할 기본값
    
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl">
      <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[90px] flex flex-col justify-between">
        <h3 className="text-2xl font-bold mb-4 select-none text-center flex justify-center items-center gap-2 mt-[-10px]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">디지털</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-400 to-orange-400">시계</span>
        </h3>
        <div className="flex flex-col items-center justify-center">
          <div className="text-3xl md:text-4xl font-bold font-mono tracking-wider text-gray-100">
            {formatTime()}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {currentDate}
          </div>
        </div>
      </div>
    </div>
  );
} 