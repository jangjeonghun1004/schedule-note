import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 여러 Todo 일괄 완료/미완료 처리
export async function PUT(request: NextRequest) {
  try {
    const { ids, completed } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "유효한 Todo ID 목록이 필요합니다." },
        { status: 400 }
      );
    }
    
    // 일괄 업데이트
    const result = await prisma.$transaction(
      ids.map(id => 
        prisma.todo.update({
          where: { id },
          data: { completed }
        })
      )
    );
    
    return NextResponse.json({
      message: `${result.length}개의 Todo가 업데이트되었습니다.`,
      updatedCount: result.length
    });
  } catch (error) {
    console.error("Todo 일괄 업데이트 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Todo 일괄 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 여러 Todo 일괄 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "유효한 Todo ID 목록이 필요합니다." },
        { status: 400 }
      );
    }
    
    // 일괄 삭제
    const { count } = await prisma.todo.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    
    return NextResponse.json({
      message: `${count}개의 Todo가 삭제되었습니다.`,
      deletedCount: count
    });
  } catch (error) {
    console.error("Todo 일괄 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Todo 일괄 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
} 