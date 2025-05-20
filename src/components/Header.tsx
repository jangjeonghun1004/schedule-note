"use client";

import { useState, useRef, useEffect } from 'react';
import { Settings, Sun, Moon, RefreshCw, Trash2 } from 'lucide-react';

export default function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크 모드 설정 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const darkMode = localStorage.getItem('darkMode');
      setIsDarkMode(darkMode === 'true');
      if (darkMode === 'true') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // 다크 모드 토글 함수
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', newDarkMode.toString());
    setIsSettingsOpen(false);
  };

  // 설정 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl mb-6">
      <header className="bg-[#232325] rounded-xl px-5 py-4 flex justify-between items-center transition-colors duration-200">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-7 h-7"
          >
            <defs>
              <linearGradient id="calendarGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FACC15" /> {/* yellow-400 */}
                <stop offset="100%" stopColor="#F97316" /> {/* orange-500 */}
              </linearGradient>
              <linearGradient id="calendarGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" /> {/* pink-500 */}
                <stop offset="50%" stopColor="#F87171" /> {/* red-400 */}
                <stop offset="100%" stopColor="#FB923C" /> {/* orange-400 */}
              </linearGradient>
            </defs>
            {/* 캘린더 외부 프레임 */}
            <rect x="3" y="4" width="18" height="18" rx="2" fill="url(#calendarGradient2)" strokeWidth="0" />
            {/* 캘린더 내부 */}
            <rect x="4" y="8" width="16" height="13" rx="1" fill="#232325" strokeWidth="0" />
            {/* 캘린더 상단 */}
            <rect x="4" y="5" width="16" height="3" rx="1" fill="#232325" strokeWidth="0" />
            {/* 캘린더 다리 부분 */}
            <rect x="7" y="2" width="2" height="4" rx="1" fill="url(#calendarGradient1)" strokeWidth="0" />
            <rect x="15" y="2" width="2" height="4" rx="1" fill="url(#calendarGradient1)" strokeWidth="0" />
            {/* 캘린더 날짜 표시 */}
            <circle cx="7.5" cy="11.5" r="1" fill="url(#calendarGradient1)" />
            <circle cx="12" cy="11.5" r="1" fill="url(#calendarGradient2)" />
            <circle cx="16.5" cy="11.5" r="1" fill="url(#calendarGradient1)" />
            <circle cx="7.5" cy="15.5" r="1" fill="url(#calendarGradient2)" />
            <circle cx="12" cy="15.5" r="1" fill="url(#calendarGradient1)" />
            <circle cx="16.5" cy="15.5" r="1" fill="url(#calendarGradient2)" />
          </svg>
          <h1 className="text-2xl font-bold text-center flex justify-center items-center gap-2 select-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">스케쥴</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-400 to-orange-400">NOTE</span>
          </h1>
        </div>

        {/* 설정 아이콘 */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="p-2 rounded-full hover:bg-gray-100/10 transition-colors"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="설정"
          >
            <Settings 
              className="h-5 w-5 text-gray-300" 
              strokeWidth={2}
            />
          </button>

          {/* 설정 드롭다운 메뉴 */}
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#232325] rounded-md shadow-lg z-10 border border-gray-700 overflow-hidden">
              <div className="py-1">
                <button
                  className="flex w-full items-center gap-3 text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-500" />
                  )}
                  {isDarkMode ? '라이트 모드로 전환' : '위젯 관리'}
                </button>
                
                <button
                  className="flex w-full items-center gap-3 text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                  onClick={() => {
                    // 위젯 초기화 기능
                    if (confirm('모든 위젯 위치를 초기화하시겠습니까?')) {
                      localStorage.removeItem('widgetsLayout');
                      window.location.reload();
                    }
                    setIsSettingsOpen(false);
                  }}
                >
                  <RefreshCw className="h-4 w-4 text-green-500" />
                  위젯 위치 초기화
                </button>
                
                <button
                  className="flex w-full items-center gap-3 text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                  onClick={() => {
                    // 할 일 목록 초기화 기능
                    if (confirm('모든 할 일 목록을 초기화하시겠습니까?')) {
                      localStorage.removeItem('todos');
                      window.dispatchEvent(new Event('todosUpdated'));
                    }
                    setIsSettingsOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  할 일 목록 초기화
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
} 