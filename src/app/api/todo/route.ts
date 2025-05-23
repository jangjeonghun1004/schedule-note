import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Todo 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 추출
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    // 필터링 조건
    const filter: Prisma.TodoFindManyArgs = userId ? { where: { userId } } : {};
    
    const todos = await prisma.todo.findMany({
      ...filter,
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error("Todo 목록 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Todo 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// Todo 생성
export async function POST(request: NextRequest) {
  try {
    const { text, deadline, userId } = await request.json();
    
    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "할 일 내용은 필수입니다." },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID는 필수입니다." },
        { status: 400 }
      );
    }
    
    // 날짜 처리
    let deadlineDate = undefined;
    if (deadline && deadline.trim() !== '') {
      deadlineDate = new Date(deadline);

      // 현재 시간대의 오프셋(분) 구하기
      const timezoneOffset = new Date().getTimezoneOffset();
      // 오프셋만큼 조정하여 시간대 변환을 상쇄 (UTC+9의 경우 오프셋은 -540분)
      deadlineDate.setMinutes(deadlineDate.getMinutes() - timezoneOffset);
    }
    
    const todo = await prisma.todo.create({
      data: {
        text,
        deadline: deadlineDate,
        userId
      }
    });
    
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Todo 생성 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Todo 생성에 실패했습니다." },
      { status: 500 }
    );
  }
} 