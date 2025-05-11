"use client";

import { useState, useEffect } from 'react';

export default function MemoWidget() {
  const [memos, setMemos] = useState<string[]>([]);
  const [newMemo, setNewMemo] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const savedMemos = localStorage.getItem('memos');
    if (savedMemos) {
      setMemos(JSON.parse(savedMemos));
    }
  }, []);

  const saveMemos = (updatedMemos: string[]) => {
    localStorage.setItem('memos', JSON.stringify(updatedMemos));
    setMemos(updatedMemos);
  };

  const addMemo = () => {
    if (newMemo.trim() === '') return;

    const updatedMemos = [...memos, newMemo];
    saveMemos(updatedMemos);
    setNewMemo('');
  };

  const deleteMemo = (index: number) => {
    const updatedMemos = memos.filter((_, i) => i !== index);
    saveMemos(updatedMemos);
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditText(memos[index]);
  };

  const saveEdit = () => {
    if (editIndex === null) return;

    const updatedMemos = [...memos];
    updatedMemos[editIndex] = editText;
    saveMemos(updatedMemos);
    setEditIndex(null);
  };

  const cancelEdit = () => {
    setEditIndex(null);
  };

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 p-[1.5px] rounded-xl">
      <div className="bg-[#232325] rounded-xl px-5 py-4 min-h-[120px] flex flex-col justify-between">
        <h3 className="text-2xl font-bold mb-4 select-none text-center flex justify-center items-center gap-2 mt-[-10px]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">메모</span>
        </h3>
        <textarea
          className="w-full min-h-[80px] bg-transparent text-gray-100 border border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          placeholder="메모를 입력하세요..."
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
        />
        <div className="flex justify-end mt-2 gap-2">
          <button
            className="px-3 py-1 text-xs rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            onClick={addMemo}
          >
            저장
          </button>
          <button
            className="px-3 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            onClick={() => {
              setNewMemo('');
              setMemos([]);
              localStorage.removeItem('memos');
            }}
          >
            초기화
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto mt-4">
          {memos.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-2 text-sm">메모가 없습니다</p>
          ) : (
            memos.map((memo, index) => (
              <div
                key={index}
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
                ) : (
                  <>
                    <span className="flex-1 whitespace-pre-wrap break-words pr-8">{memo}</span>
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
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 