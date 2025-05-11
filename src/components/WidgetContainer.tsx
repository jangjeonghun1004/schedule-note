"use client";

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import DraggableWidget from './DraggableWidget';

type WidgetType = {
  id: string;
  component: React.ReactNode;
  column: 'left' | 'center' | 'right';
  width?: 'normal' | 'wide';
};

interface WidgetContainerProps {
  widgets: WidgetType[];
  onWidgetMove: (widgets: WidgetType[]) => void;
}

export default function WidgetContainer({ widgets: initialWidgets, onWidgetMove }: WidgetContainerProps) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [isMounted, setIsMounted] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isAnyDragging, setIsAnyDragging] = useState(false);

  // 클라이언트 사이드에서 마운트 여부 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 초기 위젯 목록이 변경되면 상태 업데이트
  useEffect(() => {
    setWidgets(initialWidgets);
  }, [initialWidgets]);

  // localStorage를 통해 드래그 상태 감지
  useEffect(() => {
    if (!isMounted) return;

    const checkDragState = () => {
      const draggedItemId = localStorage.getItem('draggedWidgetId');
      const isDragging = !!draggedItemId;
      setIsAnyDragging(isDragging);
      
      // 드래그가 끝나면 dragOverColumn 상태 초기화
      if (!isDragging) {
        setDragOverColumn(null);
      }
    };

    // dragEnd 이벤트 핸들러
    const handleDragEnd = () => {
      setDragOverColumn(null);
      setIsAnyDragging(false);
    };

    // 주기적으로 드래그 상태 확인
    const interval = setInterval(checkDragState, 100);
    
    // 이벤트 리스너 추가
    window.addEventListener('storage', checkDragState);
    window.addEventListener('dragEnd', handleDragEnd);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkDragState);
      window.removeEventListener('dragEnd', handleDragEnd);
    };
  }, [isMounted]);

  // 위젯 순서 변경 함수
  const moveWidget = (dragIndex: number, hoverIndex: number, sourceColumn: string, targetColumn: string) => {
    const draggedWidget = widgets[dragIndex];
    const newWidgets = [...widgets];
    
    // 각 컬럼별 위젯 수 계산
    const leftWidgetsCount = widgets.filter(w => w.column === 'left').length;
    const centerWidgetsCount = widgets.filter(w => w.column === 'center').length;
    const rightWidgetsCount = widgets.filter(w => w.column === 'right').length;
    
    // 드래그 중인 위젯의 현재 컬럼이 소스 컬럼의 마지막 위젯인지 확인
    const isLastWidgetInSourceColumn = 
      (sourceColumn === 'left' && leftWidgetsCount === 1) ||
      (sourceColumn === 'center' && centerWidgetsCount === 1) ||
      (sourceColumn === 'right' && rightWidgetsCount === 1);
    
    // 소스 컬럼의 마지막 위젯인 경우 이동 불가
    if (isLastWidgetInSourceColumn && sourceColumn !== targetColumn) {
      toast.error('각 영역에는 최소 1개의 위젯이 필요합니다!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#F87171',
          color: '#fff',
        },
      });
      return;
    }
    
    // 드래그된 위젯의 컬럼 업데이트
    const updatedWidget = {
      ...draggedWidget,
      column: targetColumn as 'left' | 'center' | 'right'
    };
    
    // 배열에서 드래그된 요소 제거
    newWidgets.splice(dragIndex, 1);
    
    // 새 위치에 요소 삽입
    newWidgets.splice(hoverIndex, 0, updatedWidget);
    
    // 상태 업데이트
    setWidgets(newWidgets);
    
    // 부모 컴포넌트에 알림
    onWidgetMove(newWidgets);
  };

  // 컬럼별로 위젯 필터링
  const leftWidgets = widgets.filter(w => w.column === 'left');
  const centerWidgets = widgets.filter(w => w.column === 'center');
  const rightWidgets = widgets.filter(w => w.column === 'right');

  // 각 컬럼별 빈 영역 생성 (드롭 영역 확장을 위해)
  const renderEmptyDropArea = (column: 'left' | 'center' | 'right') => {
    // 클라이언트 사이드에서만 렌더링
    if (!isMounted) return null;
    
    const columnWidgets = widgets.filter(w => w.column === column);
    if (columnWidgets.length === 0) {
      const hoverIndex = widgets.length;
      return (
        <div 
          className={`h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-600
            ${isAnyDragging ? 'border-blue-300 dark:border-blue-700' : 'border-gray-300 dark:border-gray-700 opacity-70'}
            ${dragOverColumn === column ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
            transition-all duration-200`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverColumn(column);
          }}
          onDragLeave={() => {
            setDragOverColumn(null);
          }}
          onDrop={() => {
            // 드롭 이벤트가 발생했을 때 처리
            if (typeof window !== 'undefined') {
              const draggedItemId = localStorage.getItem('draggedWidgetId');
              if (draggedItemId) {
                const draggedIndex = widgets.findIndex(w => w.id === draggedItemId);
                if (draggedIndex !== -1) {
                  const sourceColumn = widgets[draggedIndex].column;
                  
                  // 소스 컬럼의 마지막 위젯인지 확인
                  const sourceColumnWidgets = widgets.filter(w => w.column === sourceColumn);
                  if (sourceColumnWidgets.length === 1) {
                    toast.error('각 영역에는 최소 1개의 위젯이 필요합니다!', {
                      duration: 2000,
                      position: 'top-center',
                      style: {
                        background: '#F87171',
                        color: '#fff',
                      },
                    });
                    return;
                  }
                  
                  moveWidget(draggedIndex, hoverIndex, sourceColumn, column);
                }
                localStorage.removeItem('draggedWidgetId');
              }
            }
            setDragOverColumn(null);
          }}
        >
          {isAnyDragging ? '여기에 놓기' : '위젯을 이곳에 드래그하세요'}
        </div>
      );
    }
    return null;
  };

  // 위젯이 해당 컬럼의 마지막 위젯인지 확인하는 함수
  const isLastWidgetInColumn = (widgetId: string, column: 'left' | 'center' | 'right') => {
    const columnWidgets = widgets.filter(w => w.column === column);
    // 컬럼에 위젯이 1개만 있을 때만 마지막 위젯으로 간주
    return columnWidgets.length === 1 && columnWidgets[0].id === widgetId;
  };

  // 고정된 위젯을 드래그하려고 할 때 알림 표시
  const showLockedWidgetToast = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  고정된 위젯
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  이 위젯은 고정되어 있어 다른 영역으로 이동할 수 없습니다.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              확인
            </button>
          </div>
        </div>
      ),
      { duration: 3000, position: 'top-center' }
    );
  };

  // 하단 드롭 영역 렌더링 함수
  const renderBottomDropArea = (column: 'left' | 'center' | 'right') => {
    if (!isMounted) return null;
    
    const columnWidgets = widgets.filter(w => w.column === column);
    if (columnWidgets.length === 0) return null;
    
    // 드래그 중이 아니면 표시하지 않음 (isAnyDragging이 true일 때만 표시)
    if (!isAnyDragging) return (
      <div 
        className="h-12"
      />
    );
    
    return (
      <div 
        className={`h-12 border-2 border-dashed rounded-lg flex items-center justify-center text-xs p-10
          ${dragOverColumn === column + '-bottom'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
            : 'border-blue-300 dark:border-blue-700 text-blue-500 dark:text-blue-400'
          } transition-all duration-200`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverColumn(column + '-bottom');
        }}
        onDragLeave={() => {
          setDragOverColumn(null);
        }}
        onDrop={() => {
          if (typeof window !== 'undefined') {
            const draggedItemId = localStorage.getItem('draggedWidgetId');
            if (draggedItemId) {
              const draggedIndex = widgets.findIndex(w => w.id === draggedItemId);
              if (draggedIndex !== -1) {
                const sourceColumn = widgets[draggedIndex].column;
                
                // 소스 컬럼의 마지막 위젯인지 확인
                const sourceColumnWidgets = widgets.filter(w => w.column === sourceColumn);
                if (sourceColumnWidgets.length === 1 && sourceColumn !== column) {
                  toast.error('각 영역에는 최소 1개의 위젯이 필요합니다!', {
                    duration: 2000,
                    position: 'top-center',
                    style: {
                      background: '#F87171',
                      color: '#fff',
                    },
                  });
                  setDragOverColumn(null);
                  return;
                }
                
                // 컬럼의 마지막에 추가
                const hoverIndex = widgets.length;
                moveWidget(draggedIndex, hoverIndex, sourceColumn, column);
              }
              localStorage.removeItem('draggedWidgetId');
            }
          }
          setDragOverColumn(null);
        }}
      >
        {dragOverColumn === column + '-bottom' ? '영역 위에 배치해 주세요.' : '위젯을 이곳에 드래그하세요.'}
      </div>
    );
  };

  // 서버 사이드 렌더링과 클라이언트 사이드 렌더링 간의 불일치 방지
  if (!isMounted) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3 flex flex-col gap-4">
          {leftWidgets.map((widget) => (
            <div key={widget.id} className="mb-4">{widget.component}</div>
          ))}
        </div>
        <div className="md:col-span-6 flex flex-col gap-4">
          {centerWidgets.map((widget) => (
            <div key={widget.id} className="mb-4 w-2/3 mx-auto">{widget.component}</div>
          ))}
        </div>
        <div className="md:col-span-3 flex flex-col gap-4">
          {rightWidgets.map((widget) => (
            <div key={widget.id} className="mb-4">{widget.component}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* 좌측 컬럼 */}
        <div className="md:col-span-3 flex flex-col gap-4">
          {leftWidgets.map((widget) => {
            const globalIndex = widgets.findIndex(w => w.id === widget.id);
            const isLastWidget = isLastWidgetInColumn(widget.id, 'left');
            
            return (
              <DraggableWidget
                key={widget.id}
                id={widget.id}
                index={globalIndex}
                moveWidget={moveWidget}
                column="left"
                isLocked={isLastWidget}
                onLockedDragAttempt={showLockedWidgetToast}
              >
                {widget.component}
              </DraggableWidget>
            );
          })}
          {renderBottomDropArea('left')}
          {renderEmptyDropArea('left')}
        </div>

        {/* 가운데 컬럼 */}
        <div className="md:col-span-6 flex flex-col gap-4">
          {centerWidgets.map((widget) => {
            const globalIndex = widgets.findIndex(w => w.id === widget.id);
            const isLastWidget = isLastWidgetInColumn(widget.id, 'center');
            
            return (
              <DraggableWidget
                key={widget.id}
                id={widget.id}
                index={globalIndex}
                moveWidget={moveWidget}
                column="center"
                className="w-2/3 mx-auto"
                isLocked={isLastWidget}
                onLockedDragAttempt={showLockedWidgetToast}
              >
                {widget.component}
              </DraggableWidget>
            );
          })}
          {renderBottomDropArea('center')}
          {renderEmptyDropArea('center')}
        </div>

        {/* 우측 컬럼 */}
        <div className="md:col-span-3 flex flex-col gap-4">
          {rightWidgets.map((widget) => {
            const globalIndex = widgets.findIndex(w => w.id === widget.id);
            const isLastWidget = isLastWidgetInColumn(widget.id, 'right');
            
            return (
              <DraggableWidget
                key={widget.id}
                id={widget.id}
                index={globalIndex}
                moveWidget={moveWidget}
                column="right"
                isLocked={isLastWidget}
                onLockedDragAttempt={showLockedWidgetToast}
              >
                {widget.component}
              </DraggableWidget>
            );
          })}
          {renderBottomDropArea('right')}
          {renderEmptyDropArea('right')}
        </div>
      </div>
    </>
  );
} 