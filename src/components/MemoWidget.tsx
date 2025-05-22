"use client";

import { useState, useEffect } from 'react';

type Memo = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export default function MemoWidget() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 메모 목록 불러오기
  const fetchMemos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/memo');
      
      if (!response.ok) {
        throw new Error('메모 불러오기에 실패했습니다.');
      }
      
      const data = await response.json();
      setMemos(data);
    } catch (err) {
      console.error('메모 불러오기 오류:', err);
      setError('메모를 불러오는 중 오류가 발생했습니다.');
      // 백업: 로컬 스토리지에서 불러오기
    const savedMemos = localStorage.getItem('memos');
    if (savedMemos) {
      setMemos(JSON.parse(savedMemos));
    }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  // 메모 추가
  const addMemo = async () => {
    if (newMemo.trim() === '') return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/memo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMemo }),
      });

      if (!response.ok) {
        throw new Error('메모 추가에 실패했습니다.');
      }

      const addedMemo = await response.json();
      setMemos(prev => [addedMemo, ...prev]);
      setNewMemo('');
    } catch (err) {
      console.error('메모 추가 오류:', err);
      setError('메모를 추가하는 중 오류가 발생했습니다.');
      
      // 백업: 로컬 스토리지에 저장
      const updatedMemos = [...memos, { 
        id: Date.now().toString(),
        content: newMemo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: ""
      }];
      localStorage.setItem('memos', JSON.stringify(updatedMemos));
      setMemos(updatedMemos);
    setNewMemo('');
    } finally {
      setIsLoading(false);
    }
  };

  // 메모 삭제
  const deleteMemo = async (index: number) => {
    const memo = memos[index];

    try {
      setIsLoading(true);
      const response = await fetch(`/api/memo/${memo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('메모 삭제에 실패했습니다.');
      }

      setMemos(prevMemos => prevMemos.filter((_, i) => i !== index));
    } catch (err) {
      console.error('메모 삭제 오류:', err);
      setError('메모를 삭제하는 중 오류가 발생했습니다.');
      
      // 백업: 로컬 스토리지에 저장
    const updatedMemos = memos.filter((_, i) => i !== index);
      localStorage.setItem('memos', JSON.stringify(updatedMemos));
      setMemos(updatedMemos);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditText(memos[index].content);
  };

  const saveEdit = async () => {
    if (editIndex === null) return;
    const memo = memos[editIndex];

    try {
      setIsLoading(true);
      const response = await fetch(`/api/memo/${memo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editText }),
      });

      if (!response.ok) {
        throw new Error('메모 수정에 실패했습니다.');
      }

      const updatedMemo = await response.json();
      
      setMemos(prevMemos => {
        const newMemos = [...prevMemos];
        newMemos[editIndex] = updatedMemo;
        return newMemos;
      });
      
      setEditIndex(null);
    } catch (err) {
      console.error('메모 수정 오류:', err);
      setError('메모를 수정하는 중 오류가 발생했습니다.');
      
      // 백업: 로컬 스토리지에 저장
    const updatedMemos = [...memos];
      updatedMemos[editIndex] = {
        ...updatedMemos[editIndex],
        content: editText,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('memos', JSON.stringify(updatedMemos));
      setMemos(updatedMemos);
    setEditIndex(null);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditIndex(null);
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl">
      <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[120px] flex flex-col justify-between">
        <h3 className="text-2xl font-bold mb-4 select-none text-center flex justify-center items-center gap-2 cursor-move">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">메모</span>
        </h3>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 mb-4 rounded text-xs">
            {error}
            <button 
              className="ml-2 text-red-300 hover:text-white"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}
        <textarea
          className="w-full min-h-[80px] bg-transparent text-gray-100 border border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          placeholder="메모를 입력하세요..."
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
        />
        <div className="flex justify-end mt-2 gap-2">
          <button
            className={`px-3 py-1 text-xs rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={addMemo}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
          <button
            className="px-3 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            onClick={() => {
              setNewMemo('');
              setMemos([]);
              fetchMemos();
            }}
          >
            새로고침
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto mt-4">
          {isLoading && memos.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-2 text-sm">불러오는 중...</p>
          ) : memos.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-2 text-sm">메모가 없습니다</p>
          ) : (
            memos.map((memo, index) => (
              <div
                key={memo.id || index}
                className="bg-yellow-100/10 dark:bg-yellow-900/20 p-2 rounded-md shadow-sm border-l-4 border-yellow-500 relative text-sm text-gray-100 flex items-start gap-2"
              >
                {editIndex === index ? (
                  <div className="flex-1 flex flex-col gap-1">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#232325] text-gray-100 resize-none h-12 text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-xs text-white"
                      >
                        취소
                      </button>
                      <button
                        onClick={saveEdit}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) :
                  <>
                    <span className="flex-1 whitespace-pre-wrap break-words pr-8">{memo.content}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(index)}
                        className="text-blue-400 hover:text-blue-200 p-1 rounded-full"
                        aria-label="수정"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteMemo(index)}
                        className="text-red-400 hover:text-red-200 p-1 rounded-full"
                        aria-label="삭제"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </>
                }
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 