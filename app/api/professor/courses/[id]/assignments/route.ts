import { NextResponse, type NextRequest } from "next/server";
import { type AuthResponse } from "@/types/auth";
import { Assignment } from "@/types/assignmentProfessor";

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  let xsrfToken = "";

  // 쿠키 헤더에서 XSRF-TOKEN 추출
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const xsrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));
    if (xsrfCookie) {
      xsrfToken = xsrfCookie.substring('XSRF-TOKEN='.length);
    }
  }

  const {pathname, searchParams } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  const courseId = segments.at(-2);
  const page = searchParams.get('page');

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/professor/courses/${courseId}/assignments?page=${page || '0'}`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookieHeader || "",
        "X-XSRF-TOKEN": xsrfToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch student courses:", error);
    return NextResponse.json(
      {
        status: "error",
        code: 500,
        message: "과제 목록을 불러오는 중 오류가 발생했습니다.",
        data: null,
        error: {
          errors: [{ code: "INTERNAL_SERVER_ERROR", field: null, message: "서버 오류" }]
        }
      } as AuthResponse, // AuthResponse 대신 더 적절한 타입을 사용해야 할 수 있습니다.
      { status: 500 }
    );
  }
}
