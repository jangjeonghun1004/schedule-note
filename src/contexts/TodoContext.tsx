"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Todo } from '@/components/TodoItem';
import toast from 'react-hot-toast';

interface TodoContextType {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  fetchTodos: (userId?: string) => Promise<void>;
  addTodo: (text: string, deadline?: string, userId?: string) => Promise<void>;
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  batchUpdateTodos: (ids: string[], completed: boolean) => Promise<void>;
  batchDeleteTodos: (ids: string[]) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo는 TodoProvider 내부에서 사용해야 합니다');
  }
  return context;
};

interface TodoProviderProps {
  children: ReactNode;
  defaultUserId?: string;
}

export const TodoProvider = ({ children, defaultUserId = '' }: TodoProviderProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>(defaultUserId);

  // API 호출을 위한 기본 설정
  const API_BASE = '/api/todo';

  // 할 일 목록 불러오기
  const fetchTodos = async (newUserId?: string) => {
    if (newUserId !== undefined) {
      setUserId(newUserId);
    }
    
    const currentUserId = newUserId !== undefined ? newUserId : userId;
    
    try {
      setIsLoading(true);
      const url = currentUserId ? `${API_BASE}?userId=${currentUserId}` : API_BASE;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('할 일 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error('할 일 불러오기 오류:', err);
      setError('할 일 목록을 불러오는데 실패했습니다.');
      
      // 백업: 로컬 스토리지 사용
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 최초 로드 시 할 일 목록 가져오기
  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 할 일 추가
  const addTodo = async (text: string, deadline?: string, newUserId?: string) => {
    if (text.trim() === '') return;
    
    const currentUserId = newUserId || userId || '';
    
    console.log("TodoContext deadline", deadline);
    try {
      setIsLoading(true);
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          deadline, 
          userId: currentUserId 
        }),
      });

      if (!response.ok) {
        throw new Error('할 일 추가에 실패했습니다.');
      }

      const addedTodo = await response.json();
      setTodos(prev => [addedTodo, ...prev]);
      
      toast.success('할 일이 추가되었습니다', {
        duration: 2000,
        position: 'top-center',
      });
    } catch (err) {
      console.error('할 일 추가 오류:', err);
      setError('할 일을 추가하는데 실패했습니다.');
      
      // 백업: 로컬 스토리지 사용
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        deadline: deadline || undefined
      };
      
      const savedTodos = localStorage.getItem('todos');
      const todos = savedTodos ? JSON.parse(savedTodos) : [];
      localStorage.setItem('todos', JSON.stringify([newTodo, ...todos]));
      setTodos(prev => [newTodo, ...prev]);
      
      toast.success('할 일이 로컬에 추가되었습니다', {
        duration: 2000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 할 일 수정
  const updateTodo = async (id: string, data: Partial<Todo>) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('할 일 수정에 실패했습니다.');
      }

      const updatedTodo = await response.json();
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (err) {
      console.error('할 일 수정 오류:', err);
      setError('할 일을 수정하는데 실패했습니다.');
      
      // 백업: 로컬 스토리지 사용
      const updatedTodos = todos.map(todo => todo.id === id ? { ...todo, ...data } : todo);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
    } finally {
      setIsLoading(false);
    }
  };

  // 할 일 삭제
  const deleteTodo = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('할 일 삭제에 실패했습니다.');
      }

      setTodos(prev => prev.filter(todo => todo.id !== id));
      
      toast.success('할 일이 삭제되었습니다', {
        duration: 2000,
        position: 'top-center',
      });
    } catch (err) {
      console.error('할 일 삭제 오류:', err);
      setError('할 일을 삭제하는데 실패했습니다.');
      
      // 백업: 로컬 스토리지 사용
      const updatedTodos = todos.filter(todo => todo.id !== id);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
    } finally {
      setIsLoading(false);
    }
  };

  // 할 일 완료 상태 토글
  const toggleTodo = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('할 일 상태 변경에 실패했습니다.');
      }

      const updatedTodo = await response.json();
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (err) {
      console.error('할 일 상태 토글 오류:', err);
      setError('할 일 상태를 변경하는데 실패했습니다.');
      
      // 백업: 로컬 스토리지 사용
      const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
    } finally {
      setIsLoading(false);
    }
  };

  // 여러 할 일 일괄 수정
  const batchUpdateTodos = async (ids: string[], completed: boolean) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/batch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, completed }),
      });

      if (!response.ok) {
        throw new Error('할 일 일괄 수정에 실패했습니다.');
      }

      setTodos(prev => prev.map(todo => 
        ids.includes(todo.id) ? { ...todo, completed } : todo
      ));
      
      toast.success(`${ids.length}개의 할 일이 수정되었습니다`, {
        duration: 2000,
        position: 'top-center',
      });
    } catch (err) {
      console.error('할 일 일괄 수정 오류:', err);
      setError('할 일을 일괄 수정하는데 실패했습니다.');
      
      // 백업: 로컬 스토리지 사용
      const updatedTodos = todos.map(todo => 
        ids.includes(todo.id) ? { ...todo, completed } : todo
      );
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
    } finally {
      setIsLoading(false);
    }
  };

  // 여러 할 일 일괄 삭제
  const batchDeleteTodos = async (ids: string[]) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/batch`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('할 일 일괄 삭제에 실패했습니다.');
      }

      setTodos(prev => prev.filter(todo => !ids.includes(todo.id)));
      
      toast.success(`${ids.length}개의 할 일이 삭제되었습니다`, {
        duration: 2000,
        position: 'top-center',
      });
    } catch (err) {
      console.error('할 일 일괄 삭제 오류:', err);
      setError('할 일을 일괄 삭제하는데 실패했습니다.');
      
      // 백업: 로컬 스토리지 사용
      const updatedTodos = todos.filter(todo => !ids.includes(todo.id));
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    todos,
    isLoading,
    error,
    setError,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    batchUpdateTodos,
    batchDeleteTodos
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}; 