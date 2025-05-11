"use client";

import { useState, useEffect, useRef } from 'react';

export default function TimerWidget() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const modes = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // 타이머 종료
            clearInterval(intervalRef.current!);
            setIsActive(false);
            playAlarm();
            return;
          }
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, minutes, seconds]);

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  // const resumeTimer = () => {
  //   setIsPaused(false);
  // };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setMinutes(modes[mode]);
    setSeconds(0);
  };

  // 모드 변경 기능은 현재 사용되지 않으므로 제거
  // 추후 모드 변경 기능이 필요하면 아래 주석을 해제하고 UI에 모드 변경 버튼 추가
  // const changeMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
  //   setMode(newMode);
  //   setMinutes(modes[newMode]);
  //   setSeconds(0);
  //   setIsActive(false);
  //   setIsPaused(false);
  // };

  const playAlarm = () => {
    // 브라우저 알림 요청
    if (Notification.permission === 'granted') {
      new Notification('타이머 종료', {
        body: '타이머가 종료되었습니다.',
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('타이머 종료', {
            body: '타이머가 종료되었습니다.',
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl">
      <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[120px] flex flex-col justify-between">
        <h3 className="text-2xl font-bold mb-4 select-none text-center flex justify-center items-center gap-2 mt-[-10px]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">타이머</span>
        </h3>
        <div className="flex flex-col items-center gap-3">
          <div className="text-3xl font-mono font-bold text-gray-100 select-none">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-xs rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              onClick={startTimer}
              disabled={isActive}
            >
              시작
            </button>
            <button
              className="px-3 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
              onClick={pauseTimer}
              disabled={!isActive}
            >
              일시정지
            </button>
            <button
              className="px-3 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
              onClick={resetTimer}
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 