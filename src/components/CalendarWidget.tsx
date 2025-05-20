"use client";

import { useState } from 'react';

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 월 이름 배열
  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  // 요일 이름 배열
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 이전 달로 이동
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 현재 달의 일수 구하기
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 현재 달의 첫 날의 요일 구하기 (0: 일요일, 1: 월요일, ...)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // 캘린더 렌더링
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const currentDay = today.getDate();

    const days = [];

    // 첫 날 이전의 빈 셀 추가
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === currentDay;
      days.push(
        <div
          key={day}
          className={`h-8 w-8 flex items-center justify-center rounded-full
            ${isToday ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl">
      <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[180px] flex flex-col justify-between">
        <h3 className="text-2xl font-bold mb-4 select-none text-center flex justify-center items-center gap-2 cursor-move">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">캘린더</span>
        </h3>
        <div className="grid grid-cols-7 gap-1">
          <button
            onClick={prevMonth}
            className="h-8 w-8 flex items-center justify-center hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            &lt;
          </button>
          <div className="col-span-5 font-medium text-gray-200 flex items-center justify-center">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </div>
          <button
            onClick={nextMonth}
            className="h-8 w-8 flex items-center justify-center hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            &gt;
          </button>
          {dayNames.map((day, index) => (
            <div 
              key={index} 
              className="h-8 w-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
} 