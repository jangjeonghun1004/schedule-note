import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 메모 단일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memo = await prisma.memo.findUnique({
      where: {
        id: params.id
      }
    });

    if (!memo) {
      return NextResponse.json(
        { error: "메모를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(memo);
  } catch (error) {
    console.error("메모 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "메모 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 메모 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "메모 내용은 필수입니다." },
        { status: 400 }
      );
    }

    const updatedMemo = await prisma.memo.update({
      where: {
        id: params.id
      },
      data: {
        content
      }
    });

    return NextResponse.json(updatedMemo);
  } catch (error) {
    console.error("메모 수정 중 오류 발생:", error);
    return NextResponse.json(
      { error: "메모 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 메모 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.memo.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json(
      { message: "메모가 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("메모 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "메모 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
} 