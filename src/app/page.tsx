"use client";

import AddTodoWidget from "@/components/AddTodoWidget";
import TodoListWidget from "@/components/TodoListWidget";
import ClockWidget from "@/components/ClockWidget";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import WidgetContainer from "@/components/WidgetContainer";
import Header from "@/components/Header";
import BackgroundSelectorWidget from "@/components/BackgroundSelectorWidget";

// 클라이언트 컴포넌트로 동적 임포트 (localStorage 사용을 위해)
// const BackgroundSelector = dynamic(
//   () => import("@/components/BackgroundSelectorWidget"),
//   { ssr: false }
// );

const MemoWidget = dynamic(
  () => import("@/components/MemoWidget"),
  { ssr: false }
);

const TimerWidget = dynamic(
  () => import("@/components/TimerWidget"),
  { ssr: false }
);

const CalendarWidget = dynamic(
  () => import("@/components/CalendarWidget"),
  { ssr: false }
);

// 위젯 타입 정의
type WidgetType = {
  id: string;
  component: React.ReactNode;
  column: 'left' | 'center' | 'right';
  width?: 'normal' | 'wide';
};

// 저장된 위젯 레이아웃 정보 타입
type SavedWidgetLayout = {
  id: string;
  column: 'left' | 'center' | 'right';
  width?: 'normal' | 'wide';
};

// 초기 위젯 설정
const defaultWidgets: WidgetType[] = [
  { id: 'clock', component: <ClockWidget />, column: 'left' },
  { id: 'calendar', component: <CalendarWidget />, column: 'left' },
  { id: 'background', component: <BackgroundSelectorWidget />, column: 'left' },
  { id: 'timer', component: <TimerWidget />, column: 'left' },
  { id: 'addTodo', component: <AddTodoWidget />, column: 'center', width: 'normal' },
  { id: 'todoList', component: <TodoListWidget />, column: 'center', width: 'normal' },
  { id: 'memo', component: <MemoWidget />, column: 'right' }
];

export default function Home() {
  const [widgets, setWidgets] = useState<WidgetType[]>(defaultWidgets);
  const initialized = useRef(false);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 배경 이미지 적용 및 알림 권한 요청
  useEffect(() => {
    // 서버 사이드 렌더링 시 실행 방지
    if (!isClient) return;
    
    // 배경 이미지 적용
    const savedBackground = localStorage.getItem('selectedBackground');
    if (savedBackground && savedBackground !== 'default') {
      const bgImage = savedBackground === 'designer-1' ? '/skin/Designer-1.jpeg' : '/skin/Designer-2.jpeg';
      document.body.style.backgroundImage = `url(${bgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
    } else if (!savedBackground) {
      const bgImage = '/skin/Designer-5.png';
      document.body.style.backgroundImage = `url(${bgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center center';
      document.body.style.backgroundRepeat = 'no-repeat';
    }
    
    // 알림 권한 요청
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, [isClient]);

  // 저장된 위젯 순서 복원 (최초 1회만 실행)
  useEffect(() => {
    // 서버 사이드 렌더링 시 실행 방지
    if (!isClient || initialized.current) return;
    
    try {
      const savedWidgets = localStorage.getItem('widgetsLayout');
      if (savedWidgets) {
        const parsedWidgets = JSON.parse(savedWidgets) as SavedWidgetLayout[];
        
        // 저장된 레이아웃 정보에서 위젯 ID와 컬럼 정보만 추출
        const layoutInfo = parsedWidgets.map((w: SavedWidgetLayout) => ({ 
          id: w.id, 
          column: w.column,
          width: w.width
        }));
        
        // 기존 위젯 컴포넌트를 유지하면서 레이아웃 정보만 업데이트
        const updatedWidgets = defaultWidgets.map(widget => {
          const savedWidget = layoutInfo.find((w: SavedWidgetLayout) => w.id === widget.id);
          if (savedWidget) {
            return {
              ...widget,
              column: savedWidget.column,
              width: savedWidget.width || widget.width
            };
          }
          return widget;
        });
        
        setWidgets(updatedWidgets);
      }
      
      initialized.current = true;
    } catch (error) {
      console.error('위젯 레이아웃 복원 중 오류 발생:', error);
    }
  }, [isClient]);

  // 위젯 위치 변경 처리
  const handleWidgetMove = (updatedWidgets: WidgetType[]) => {
    setWidgets(updatedWidgets);
    
    // localStorage에 저장 (클라이언트 사이드에서만)
    if (isClient) {
      try {
        // 컴포넌트 제외하고 저장 (순환 참조 방지)
        const widgetsToSave = updatedWidgets.map(({ id, column, width }) => ({ 
          id, column, width 
        }));
        localStorage.setItem('widgetsLayout', JSON.stringify(widgetsToSave));
      } catch (error) {
        console.error('위젯 레이아웃 저장 중 오류 발생:', error);
      }
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen p-4 font-[family-name:var(--font-geist-sans)]">
        <Header />
        <WidgetContainer widgets={widgets} onWidgetMove={handleWidgetMove} />
      </div>
    </DndProvider>
  );
}
