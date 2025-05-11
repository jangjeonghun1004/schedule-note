"use client";

import { useState } from 'react';
import { Todo } from './TodoItem';

export default function AddTodoWidget() {
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false
    };
    
    // 로컬 스토리지에서 기존 할 일 목록을 가져옴
    const savedTodos = localStorage.getItem('todos');
    const todos = savedTodos ? JSON.parse(savedTodos) : [];
    
    // 새 할 일 추가
    const updatedTodos = [...todos, newTodoItem];
    
    // 로컬 스토리지에 저장
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    
    // 입력 필드 초기화
    setNewTodo('');
    
    // 이벤트 발생 - TodoListWidget에서 이 이벤트를 감지하여 목록을 업데이트
    window.dispatchEvent(new Event('todosUpdated'));
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl">
      <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[90px] flex flex-col justify-between">
      <h3 className="text-2xl font-bold mb-4 select-none text-center flex justify-center items-center gap-2 mt-[-10px]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">새 할 일</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-400 to-orange-400">추가</span>
        </h3>
        <div className="flex mt-3">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="새 할 일 입력"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          />
          <button
            onClick={addTodo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md transition-colors font-medium text-sm"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
} 