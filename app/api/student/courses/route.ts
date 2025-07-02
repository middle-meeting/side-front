import { NextResponse, type NextRequest } from "next/server";
import { type AuthResponse } from "@/types/auth";

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

  const { searchParams } = new URL(request.url);
  const semester = searchParams.get('semester');
  const page = searchParams.get('page');

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/student/courses?semester=${semester || ''}&page=${page || '0'}`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookieHeader || "",
        "X-XSRF-TOKEN": xsrfToken,
      },
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data);

    // 백엔드에서 받은 Set-Cookie 헤더를 클라이언트로 전달
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders) {
      setCookieHeaders.forEach(cookie => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Failed to fetch student courses:", error);
    return NextResponse.json(
      {
        status: "error",
        code: 500,
        message: "강의 목록을 불러오는 중 오류가 발생했습니다.",
        data: null,
        error: {
          errors: [{ code: "INTERNAL_SERVER_ERROR", field: null, message: "서버 오류" }]
        }
      } as AuthResponse, // AuthResponse 대신 더 적절한 타입을 사용해야 할 수 있습니다.
      { status: 500 }
    );
  }
}
