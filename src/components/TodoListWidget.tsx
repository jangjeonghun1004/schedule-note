"use client";

import { useState, useMemo } from 'react';
import { Todo } from './TodoItem';
import { Search } from 'lucide-react';
import { useTodo } from '@/contexts/TodoContext';

export default function TodoListWidget() {
  const { 
    todos, 
    isLoading, 
    error,
    deleteTodo: apiDeleteTodo, 
    toggleTodo: apiToggleTodo 
  } = useTodo();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');

  // 할 일 삭제 처리
  const handleDeleteTodo = (id: string) => {
    apiDeleteTodo(id);
  };

  // 할 일 완료 상태 토글 처리
  const handleToggleTodo = (id: string) => {
    apiToggleTodo(id);
  };

  // 필터링된 할 일 목록
  const filteredTodos = useMemo(() => {
    // 먼저 검색어로 필터링
    const result = searchTerm
      ? todos.filter(todo => todo.text.toLowerCase().includes(searchTerm.toLowerCase()))
      : todos;
    
    // 그 다음 상태로 필터링
    switch (filterMode) {
      case 'active':
        return result.filter(todo => !todo.completed);
      case 'completed':
        return result.filter(todo => todo.completed);
      case 'overdue': {
        const now = new Date();
        
        return result.filter(todo => {
          if (!todo.deadline || todo.completed) return false;
          
          try {
            // ISO 형식이나 공백으로 구분된 모든 형식의 날짜를 Date 객체로 변환하여 비교
            const deadlineDate = new Date(todo.deadline);
            return deadlineDate < now;
          } catch (error) {
            console.error('기한 초과 확인 오류:', error, todo.deadline);
            return false;
          }
        });
      }
      default:
        return result;
    }
  }, [todos, searchTerm, filterMode]);

  // 필터 상태별 항목 카운트
  const countTodos = {
    all: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length,
    overdue: todos.filter(todo => {
      if (!todo.deadline || todo.completed) return false;
      
      try {
        // ISO 형식이나 공백으로 구분된 모든 형식의 날짜를 Date 객체로 변환하여 비교
        const deadlineDate = new Date(todo.deadline);
        return deadlineDate < new Date();
      } catch (error) {
        console.error('기한 초과 확인 오류:', error, todo.deadline);
        return false;
      }
    }).length
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl">
      <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[120px] flex flex-col justify-between">
        {/* 타이틀 섹션 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-bold select-none text-center flex justify-center items-center gap-2 cursor-move">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">할 일</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-400 to-orange-400">목록</span>
            </h3>
          </div>
          
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 mb-3 rounded text-xs">
              {error}
            </div>
          )}
          
          {/* 검색 및 필터링 UI */}
          <div className={`transition-all duration-300 overflow-hidden max-h-[100px] opacity-100 mb-3`}>
            <div className="relative mb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="할 일 검색..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <Search className="absolute left-2.5 top-[7px] h-4 w-4 text-gray-500" />
              {searchTerm && (
                <button
                  className="absolute right-2 top-[7px] text-gray-400 hover:text-white"
                  onClick={() => setSearchTerm('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* 필터 버튼 */}
          <div className="flex space-x-2 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-1 rounded-md flex items-center ${
                filterMode === 'all'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
              } transition-colors`}
            >
              모두 <span className="ml-1.5 text-gray-500">{countTodos.all}</span>
            </button>
            <button
              onClick={() => setFilterMode('active')}
              className={`px-2 py-1 rounded-md flex items-center ${
                filterMode === 'active'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
              } transition-colors`}
            >
              진행중 <span className="ml-1.5 text-gray-500">{countTodos.active}</span>
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-2 py-1 rounded-md flex items-center ${
                filterMode === 'completed'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
              } transition-colors`}
            >
              완료 <span className="ml-1.5 text-gray-500">{countTodos.completed}</span>
            </button>
            <button
              onClick={() => setFilterMode('overdue')}
              className={`px-2 py-1 rounded-md flex items-center ${
                filterMode === 'overdue'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
              } transition-colors`}
            >
              기한초과 <span className="ml-1.5 text-gray-500">{countTodos.overdue}</span>
            </button>
          </div>
        </div>
        
        {/* 목록 섹션 */}
        <div className="flex-1 overflow-hidden">
          {isLoading && todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin mx-auto mb-3 h-6 w-6 border-2 border-t-transparent border-blue-500 rounded-full"></div>
              <p>로딩 중...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>할 일이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2 pr-1">
              {filteredTodos.map(todo => (
                <TodoItemWidget
                  key={todo.id}
                  todo={todo}
                  onDelete={handleDeleteTodo}
                  onToggle={handleToggleTodo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 독립적인 TodoItem 위젯
function TodoItemWidget({ todo, onDelete, onToggle }: {
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  // 마감일 포맷팅 함수
  const formatDeadline = (deadline: string) => {
    if (!deadline) return null;
    
    try {
      // 데이터베이스 형식의 날짜 문자열을 Date 객체로 변환
      const date = new Date(deadline);
      
      // 날짜가 유효하지 않으면 null 반환
      if (isNaN(date.getTime())) return null;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const deadlineDate = new Date(date);
      deadlineDate.setHours(0, 0, 0, 0);
      
      // 날짜 포맷 옵션
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      
      // 시간 표시 여부 확인 (ISO 형식 또는 공백으로 구분된 형식 모두 처리)
      const hasTime = (
        (deadline.includes('T') && !deadline.includes('T00:00:00.000Z')) || 
        (deadline.includes(' ') && deadline.split(' ')[1] !== '00:00:00')
      );
      
      // 오늘, 내일, 나머지 날짜 구분하여 표시
      let dateText = '';
      if (deadlineDate.getTime() === today.getTime()) {
        dateText = '오늘';
      } else if (deadlineDate.getTime() === tomorrow.getTime()) {
        dateText = '내일';
      } else {
        dateText = new Intl.DateTimeFormat('ko-KR', dateOptions).format(date);
      }
      
      // 시간 포맷팅
      let timeText = '';
      if (hasTime) {
        timeText = new Intl.DateTimeFormat('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).format(date);
      }
      
      return hasTime ? `${dateText} ${timeText}` : dateText;
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return null;
    }
  };
  
  // 마감일 지났는지 확인
  const isOverdue = () => {
    if (!todo.deadline) return false;
    if (todo.completed) return false;
    
    try {
      // ISO 형식이나 공백으로 구분된 모든 형식의 날짜를 Date 객체로 변환하여 비교
      const deadlineDate = new Date(todo.deadline);
      const now = new Date();
      
      return deadlineDate < now;
    } catch (error) {
      console.error('기한 초과 확인 오류:', error, todo.deadline);
      return false;
    }
  };

  const deadlineText = todo.deadline ? formatDeadline(todo.deadline) : null;
  const overdue = isOverdue();

  // 추가: 삭제 애니메이션 처리
  const handleDelete = () => {
    setIsLeaving(true);
    // 애니메이션 후 삭제 실행
    setTimeout(() => {
      onDelete(todo.id);
    }, 300);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-all duration-300 ${
        isLeaving ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
      } ${
        todo.completed ? 'border-l-4 border-green-500' : overdue ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <div className="flex items-center justify-center pt-0.5">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              className="sr-only peer" // 접근성을 위한 숨김 체크박스
              id={`todo-${todo.id}`}
            />
            <label
              htmlFor={`todo-${todo.id}`}
              className="w-5 h-5 border-2 rounded-full cursor-pointer flex items-center justify-center
                peer-checked:bg-green-500 peer-checked:border-green-500
                border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400
                transition-all duration-200"
            >
              {todo.completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </label>
          </div>
          
          <div className="flex-1 pl-1">
            <p className={`text-sm transition-all duration-200 break-words whitespace-normal break-all overflow-wrap-anywhere ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
              {todo.text}
            </p>
            
            {deadlineText && (
              <p className={`text-xs mt-1 flex items-center ${
                todo.completed ? 'text-gray-500' : 
                overdue ? 'text-red-500 font-medium' : 'text-blue-500'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" 
                  className="h-3 w-3 inline-block mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {deadlineText}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleDelete}
          className={`text-gray-400 hover:text-red-500 p-1.5 rounded-full transition-all ${isHovered ? 'opacity-100 bg-gray-100/10' : 'opacity-50'}`}
          aria-label="삭제"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
} 