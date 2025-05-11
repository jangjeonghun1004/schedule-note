"use client";

import { useState, useEffect } from 'react';
import { Todo } from './TodoItem';

export default function TodoListWidget() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // 할 일 목록 불러오기
  const loadTodos = () => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  };

  useEffect(() => {
    // 초기 로딩
    loadTodos();

    // todosUpdated 이벤트 리스너 등록 (AddTodoWidget에서 발생)
    const handleTodosUpdated = () => loadTodos();
    window.addEventListener('todosUpdated', handleTodosUpdated);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('todosUpdated', handleTodosUpdated);
    };
  }, []);

  // 할 일 삭제
  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    setTodos(updatedTodos);
  };

  // 할 일 완료 상태 토글
  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    setTodos(updatedTodos);
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl">
      <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[120px] flex flex-col justify-between">
        {/* 타이틀 섹션 */}
        <div className="p-0 mb-4">
          <h3 className="text-2xl font-bold mb-4 select-none text-center flex justify-center items-center gap-2 mt-[-10px]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">할 일</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-400 to-orange-400">목록</span>
          </h3>
        </div>
        {/* 할 일 목록 섹션 */}
        <div className="p-0">
          {todos.length === 0 ? (
            <div className="flex items-center justify-center py-6 bg-transparent rounded-md">
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm">할 일이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {todos.map(todo => (
                <TodoItemWidget
                  key={todo.id}
                  todo={todo}
                  onDelete={deleteTodo}
                  onToggle={toggleTodo}
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

  return (
    <div
      className={`bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm ${todo.completed ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="w-4 h-4 accent-blue-500 cursor-pointer"
          />
          <p className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {todo.text}
          </p>
        </div>

        <button
          onClick={() => onDelete(todo.id)}
          className={`text-red-500 hover:text-red-700 p-1 rounded-full transition-opacity ${isHovered ? 'opacity-100' : 'opacity-50'
            }`}
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