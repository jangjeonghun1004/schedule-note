"use client";

import { useState, useRef, useEffect } from 'react';
import { Calendar, Settings, Sun, Moon, RefreshCw, Trash2 } from 'lucide-react';

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
    <header className="bg-white dark:bg-gray-800 shadow-sm py-3 px-4 mb-6 rounded-lg flex justify-between items-center transition-colors duration-200">
      {/* 로고 */}
      <div className="flex items-center gap-2">
        <Calendar 
          className="h-6 w-6 text-blue-500" 
          strokeWidth={2}
        />
        <h1 className="text-2xl font-bold text-center flex justify-center items-center gap-2 select-none">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">스케쥴</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-400 to-orange-400">NOTE</span>
        </h1>
      </div>

      {/* 설정 아이콘 */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          aria-label="설정"
        >
          <Settings 
            className="h-5 w-5 text-gray-600 dark:text-gray-300" 
            strokeWidth={2}
          />
        </button>

        {/* 설정 드롭다운 메뉴 */}
        {isSettingsOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="py-1">
              <button
                className="flex w-full items-center gap-3 text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                className="flex w-full items-center gap-3 text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                className="flex w-full items-center gap-3 text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
  );
} 