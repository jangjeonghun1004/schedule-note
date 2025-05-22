import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 메모 목록 조회
export async function GET() {
  try {
    const memos = await prisma.memo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(memos);
  } catch (error) {
    console.error("메모 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "메모 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 메모 추가
export async function POST(request: NextRequest) {
  try {
    const { content, userId } = await request.json();
    
    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "메모 내용은 필수입니다." },
        { status: 400 }
      );
    }
    
    const memo = await prisma.memo.create({
      data: {
        content,
        userId: userId || ""
      }
    });
    
    return NextResponse.json(memo, { status: 201 });
  } catch (error) {
    console.error("메모 생성 중 오류 발생:", error);
    return NextResponse.json(
      { error: "메모 생성에 실패했습니다." },
      { status: 500 }
    );
  }
} 