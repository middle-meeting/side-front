import { NextResponse, type NextRequest } from "next/server";
import { AuthResponse } from "@/types/auth";

export async function GET(request: NextRequest, { params }: { params: { assignmentId: string } }) {
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

  const { assignmentId } = await params;

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/student/assignments/${assignmentId}/chat/messages`;
    
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
    console.error(`Failed to fetch chat messages for assignment ${assignmentId}:`, error);
    return NextResponse.json(
      {
        status: "error",
        code: 500,
        message: "채팅 기록을 불러오는 중 오류가 발생했습니다.",
        data: null,
        error: {
          errors: [{ code: "INTERNAL_SERVER_ERROR", field: null, message: "서버 오류" }]
        }
      } as AuthResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { assignmentId: string } }) {
  const cookieHeader = request.headers.get("cookie");
  let xsrfToken = "";

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const xsrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));
    if (xsrfCookie) {
      xsrfToken = xsrfCookie.substring('XSRF-TOKEN='.length);
    }
  }

  const { assignmentId } = await params;
  const body = await request.json();

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/student/assignments/${assignmentId}/chat/messages`;
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookieHeader || "",
        "X-XSRF-TOKEN": xsrfToken,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data);

    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders) {
      setCookieHeaders.forEach(cookie => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    console.error(`Failed to send chat message for assignment ${assignmentId}:`, error);
    return NextResponse.json(
      {
        status: "error",
        code: 500,
        message: "채팅 메시지 전송 중 오류가 발생했습니다.",
        data: null,
        error: {
          errors: [{ code: "INTERNAL_SERVER_ERROR", field: null, message: "서버 오류" }]
        }
      } as AuthResponse,
      { status: 500 }
    );
  }
}
