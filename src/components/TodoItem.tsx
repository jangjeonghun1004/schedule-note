"use client";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  deadline?: string; // 마감일(필수 아님): ISO 형식의 날짜 문자열
}; 