import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Todo 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const todo = await prisma.todo.findUnique({
      where: {
        id
      }
    });

    if (!todo) {
      return NextResponse.json(
        { error: "해당하는 할 일을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Todo 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Todo 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// Todo 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { text, completed, deadline } = await request.json();
    
    // 날짜 처리
    let deadlineDate = undefined;
    if (deadline === null) {
      // deadline이 null인 경우 - 마감일 제거
      deadlineDate = null;
    } else if (deadline && deadline.trim() !== '') {
      // deadline이 있는 경우 - Date 객체로 변환
      deadlineDate = new Date(deadline);
    }
    
    // 업데이트할 데이터 생성
    const updateData: {
      text?: string;
      completed?: boolean;
      deadline?: Date | null;
    } = {};
    
    if (text !== undefined) updateData.text = text;
    if (completed !== undefined) updateData.completed = completed;
    if (deadlineDate !== undefined) updateData.deadline = deadlineDate;
    
    const updatedTodo = await prisma.todo.update({
      where: {
        id
      },
      data: updateData
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("Todo 수정 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Todo 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// Todo 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.todo.delete({
      where: {
        id
      }
    });

    return NextResponse.json(
      { message: "Todo가 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Todo 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Todo 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

// Todo 완료 상태 토글 (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 현재 Todo 가져오기
    const currentTodo = await prisma.todo.findUnique({
      where: {
        id
      }
    });

    if (!currentTodo) {
      return NextResponse.json(
        { error: "해당하는 할 일을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 완료 상태 토글
    const updatedTodo = await prisma.todo.update({
      where: {
        id
      },
      data: {
        completed: !currentTodo.completed
      }
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("Todo 상태 토글 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Todo 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
} 