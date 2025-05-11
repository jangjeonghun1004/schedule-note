"use client";

import React, { useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface DraggableWidgetProps {
  id: string;
  index: number;
  moveWidget: (dragIndex: number, hoverIndex: number, sourceColumn: string, targetColumn: string) => void;
  children: React.ReactNode;
  column: 'left' | 'center' | 'right';
  className?: string;
  isLocked?: boolean;
  onLockedDragAttempt?: () => void;
}

export default function DraggableWidget({ 
  id, 
  index, 
  moveWidget, 
  children, 
  column, 
  className = '', 
  isLocked = false,
  onLockedDragAttempt
}: DraggableWidgetProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'WIDGET',
    item: () => {
      // 위젯이 잠겨있으면 드래그 불가
      if (isLocked) {
        // 드래그 시도 시 알림 표시
        if (onLockedDragAttempt) {
          onLockedDragAttempt();
        }
        return null;
      }
      
      // 클라이언트 사이드에서만 localStorage 사용
      if (typeof window !== 'undefined') {
        localStorage.setItem('draggedWidgetId', id);
      }
      return { id, index, column };
    },
    canDrag: !isLocked, // 잠긴 위젯은 드래그 불가
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      // 클라이언트 사이드에서만 localStorage 사용
      if (typeof window !== 'undefined') {
        localStorage.removeItem('draggedWidgetId');
        
        // 추가: 전역 이벤트 발생 - 드래그 종료 알림
        window.dispatchEvent(new Event('dragEnd'));
      }
    }
  });

  // 컴포넌트 언마운트 시 draggedWidgetId 제거
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && localStorage.getItem('draggedWidgetId') === id) {
        localStorage.removeItem('draggedWidgetId');
      }
    };
  }, [id]);

  const [{ isOver }, drop] = useDrop({
    accept: 'WIDGET',
    hover: (item: { id: string; index: number; column: string }) => {
      // 드래그 중인 아이템이 자신이면 무시
      if (item.id === id) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceColumn = item.column;
      const targetColumn = column;

      // 자신을 자신 위에 드롭하는 경우 무시 (같은 위치, 같은 컬럼)
      if (dragIndex === hoverIndex && sourceColumn === targetColumn) {
        return;
      }

      // 고정된 위젯이 다른 컬럼으로 이동하려는 경우 무시
      // 하지만 다른 위젯이 고정된 위젯 위치로 이동하는 것은 허용
      if (isLocked && item.id === id && sourceColumn !== targetColumn) {
        return;
      }

      // 같은 컬럼 내에서는 위치 변경 허용
      moveWidget(dragIndex, hoverIndex, sourceColumn, targetColumn);
      
      // 드래그 중인 아이템의 인덱스와 컬럼 업데이트
      item.index = hoverIndex;
      item.column = targetColumn;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // ref 결합
  const ref = (node: HTMLDivElement | null) => {
    drag(drop(node));
  };

  return (
    <div
      ref={ref}
      className={`mb-4 transition-all duration-200 ${
        isDragging 
          ? 'opacity-50 scale-95' 
          : isOver 
            ? 'opacity-100 scale-105 shadow-lg' 
            : 'opacity-100'
      } ${isLocked ? '' : 'cursor-move'} ${className}`}
      style={{
        position: 'relative',
        zIndex: isDragging ? 100 : 1
      }}
    >
      {/* 드래그 핸들 아이콘 - 잠긴 위젯에는 표시하지 않음 */}
      {!isLocked && (
        <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>
      )}
      
      {children}
    </div>
  );
} 