"use client";

import { useState, useRef, useEffect } from 'react';
import { Todo } from './TodoItem';
import { Plus, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// 날짜와 시간 입력 필드 스타일 추가
const dateTimeInputStyles = `
  /* 날짜/시간 입력 필드 아이콘 색상을 텍스트 색상과 일치시키기 */
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.7;
    cursor: pointer;
  }
  
  /* 호버 시 불투명도 증가 */
  input[type="date"]::-webkit-calendar-picker-indicator:hover,
  input[type="time"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
  
  /* 애니메이션 효과 */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
  
  .fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }
  
  /* 커스텀 스크롤바 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export default function AddTodoWidget() {
  const [newTodo, setNewTodo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showDeadline, setShowDeadline] = useState(false);
  const [charCount, setCharCount] = useState(0);
  
  // 날짜/시간 피커 토글을 위한 ref
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const todoInputRef = useRef<HTMLInputElement>(null);

  // 현재 날짜 구하기
  const today = new Date().toISOString().split('T')[0];

  // 컴포넌트 마운트 시 할 일 입력 필드에 포커스
  useEffect(() => {
    if (todoInputRef.current) {
      todoInputRef.current.focus();
    }
  }, []);

  // 할 일 입력 시 글자 수 카운트
  useEffect(() => {
    setCharCount(newTodo.length);
  }, [newTodo]);
  
  // ISO 형식(YYYY-MM-DDTHH:MM)을 데이터베이스 datetime 형식(YYYY-MM-DD HH:MM:SS)으로 변환
  const formatToDatetimeFormat = (isoString: string): string => {
    if (!isoString) return '';
    
    // T 구분자를 공백으로 대체하고 초 추가
    const [datePart, timePart] = isoString.split('T');
    
    // 오후 12:00인 경우 23:59:57로 치환
    if (timePart === '12:00') {
      return `${datePart} 23:59:57`;
    }
    
    return `${datePart} ${timePart}:00`;
  };
  
  // 할 일 추가 함수
  const addTodo = () => {
    if (newTodo.trim() === '') {
      toast.error('할 일 내용을 입력해주세요', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#F56565',
          color: '#fff',
        },
      });
      if (todoInputRef.current) {
        todoInputRef.current.focus();
      }
      return;
    }
    
    if (showDeadline && !deadline) {
      toast.error('마감일을 설정해주세요', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#F56565',
          color: '#fff',
        },
      });
      if (dateInputRef.current) {
        dateInputRef.current.focus();
      }
      return;
    }
    
    // 애니메이션 효과
    setIsAdding(true);
    
    // 마감일을 데이터베이스 형식으로 변환 (옵션이 활성화된 경우에만)
    const dbFormattedDeadline = (showDeadline && deadline) ? formatToDatetimeFormat(deadline) : undefined;
    
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      deadline: dbFormattedDeadline
    };
    
    try {
      // 로컬 스토리지 처리
      const savedTodos = localStorage.getItem('todos');
      const todos = savedTodos ? JSON.parse(savedTodos) : [];
      localStorage.setItem('todos', JSON.stringify([...todos, newTodoItem]));
      
      // 이벤트 발생
      window.dispatchEvent(new Event('todosUpdated'));
      
      // 성공 알림
      toast.success('할 일이 추가되었습니다', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#48BB78',
          color: '#fff',
        },
      });
      
      // 폼 초기화
      setTimeout(() => {
        setNewTodo('');
        setDeadline('');
        setShowDeadline(false); // 마감일 설정 옵션 비활성화
        setIsAdding(false);
        
        // 할 일 입력 필드에 포커스
        if (todoInputRef.current) {
          todoInputRef.current.focus();
        }
      }, 300);
    } catch (error) {
      console.error('할 일 추가 오류:', error);
      toast.error('할 일을 추가하는 중 오류가 발생했습니다', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#F56565',
          color: '#fff',
        },
      });
      setIsAdding(false);
    }
  };

  // 날짜 및 시간 처리 함수
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      // 시간 값이 있으면 유지하고, 없으면 기본값 00:00 설정
      const timeValue = deadline && deadline.includes('T') ? deadline.split('T')[1] : '00:00';
      
      // ISO 8601 형식으로 임시 저장 (YYYY-MM-DDTHH:mm)
      setDeadline(`${dateValue}T${timeValue}`);
      
      // 시간 입력 필드로 포커스 이동
      setTimeout(() => {
        if (timeInputRef.current) {
          timeInputRef.current.focus();
        }
      }, 100);
    } else {
      setDeadline('');
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    // 시간값이 없을 경우 현재 날짜 또는 기존 날짜를 사용
    const dateValue = deadline && deadline.includes('T') ? deadline.split('T')[0] : today;
    
    // ISO 8601 형식으로 임시 저장 (YYYY-MM-DDTHH:mm)
    setDeadline(`${dateValue}T${timeValue}`);
  };
  
  // 마감일 설정 토글
  const toggleDeadline = () => {
    const newValue = !showDeadline;
    setShowDeadline(newValue);
    
    // 마감일 설정 활성화 시 날짜 입력 필드에 포커스
    if (newValue && !deadline) {
      // 날짜가 설정되지 않은 경우 기본값 설정 (오늘)
      setDeadline(`${today}T00:00`);
      setTimeout(() => {
        if (dateInputRef.current) {
          dateInputRef.current.focus();
        }
      }, 100);
    }
  };
  
  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        addTodo();
      }
    }
  };

  return (
    <>
      <style jsx global>{dateTimeInputStyles}</style>
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl shadow-lg">
        <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[90px] flex flex-col justify-between">
          <h3 className="text-xl font-bold mb-4 select-none text-center flex justify-center items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">새 할 일</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-400 to-orange-400">추가</span>
          </h3>
          
          <div className={`flex flex-col gap-4 transition-all duration-300 ${isAdding ? 'opacity-50' : 'opacity-100'}`}>
            {/* 할 일 입력 영역 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="todo-input" className="text-xs text-gray-300 font-medium">할 일 내용</label>
                <div className="flex items-center gap-2">
                  {newTodo && (
                    <span className={`text-xs ${
                      charCount > 50 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {charCount}/100
                    </span>
                  )}
                  {newTodo && (
                    <button 
                      onClick={() => setNewTodo('')}
                      className="text-xs text-gray-500 hover:text-gray-300"
                      aria-label="입력 내용 지우기"
                    >
                      지우기
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  id="todo-input"
                  ref={todoInputRef}
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value.slice(0, 100))}
                  placeholder="새 할 일을 입력하세요"
                  className="flex-1 px-3 py-2.5 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white text-sm"
                  onKeyDown={handleKeyDown}
                  disabled={isAdding}
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={toggleDeadline}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-all whitespace-nowrap ${
                    showDeadline 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Calendar size={14} className="flex-shrink-0" />
                  <span>마감일</span>
                </button>
              </div>
            </div>
            
            {/* 마감일 설정 영역 - 조건부 렌더링 */}
            {showDeadline && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 fade-in`}>
                {/* 날짜 선택 */}
                <div className="space-y-1">
                  <label htmlFor="date-input" className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    <span>날짜</span>
                  </label>
                  <div className="relative">
                    <input
                      id="date-input"
                      ref={dateInputRef}
                      type="date"
                      value={deadline ? deadline.split('T')[0] : ''}
                      min={today}
                      onChange={handleDateChange}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white text-sm"
                      disabled={isAdding}
                    />
                    <div 
                      className="absolute inset-0 cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // 인라인 토글 함수
                        if (dateInputRef.current) {
                          if (document.activeElement === dateInputRef.current) {
                            dateInputRef.current.blur();
                            setTimeout(() => {
                              if (dateInputRef.current) {
                                dateInputRef.current.focus();
                                dateInputRef.current.showPicker();
                              }
                            }, 10);
                          } else {
                            dateInputRef.current.focus();
                            dateInputRef.current.showPicker();
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* 시간 선택 (날짜가 선택된 경우에만) */}
                {deadline && (
                  <div className="space-y-1">
                    <label htmlFor="time-input" className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      <span>시간</span>
                    </label>
                    <div className="relative">
                      <input
                        id="time-input"
                        ref={timeInputRef}
                        type="time"
                        value={deadline && deadline.includes('T') ? deadline.split('T')[1] : ''}
                        onChange={handleTimeChange}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white text-sm"
                        disabled={isAdding}
                      />
                      <div 
                        className="absolute inset-0 cursor-pointer" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // 인라인 토글 함수
                          if (timeInputRef.current) {
                            if (document.activeElement === timeInputRef.current) {
                              timeInputRef.current.blur();
                              setTimeout(() => {
                                if (timeInputRef.current) {
                                  timeInputRef.current.focus();
                                  timeInputRef.current.showPicker();
                                }
                              }, 10);
                            } else {
                              timeInputRef.current.focus();
                              timeInputRef.current.showPicker();
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 추가 버튼 */}
            <button
              onClick={addTodo}
              disabled={newTodo.trim() === '' || isAdding}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-md transition-all duration-300 mt-1
                ${newTodo.trim() === '' ? 
                  'bg-gray-700 text-gray-500 cursor-not-allowed' : 
                  'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              aria-label="할 일 추가하기"
            >
              <Plus size={16} className="opacity-90" />
              <span className="font-medium">추가하기</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 