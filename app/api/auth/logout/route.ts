import { NextResponse, type NextRequest } from "next/server"
import { type AuthResponse } from "@/types/auth"

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie")
  let xsrfToken = ""

  // 쿠키 헤더에서 XSRF-TOKEN 추출
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const xsrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));
    if (xsrfCookie) {
      xsrfToken = xsrfCookie.substring('XSRF-TOKEN='.length);
    }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 백엔드가 JSON 응답을 기대할 수 있으므로 추가
        "X-Requested-With": "XMLHttpRequest", // Spring Security에서 CSRF 토큰 검증 시 필요할 수 있음
        "Cookie": cookieHeader || "", // 클라이언트로부터 받은 모든 쿠키 전달
        "X-XSRF-TOKEN": xsrfToken, // 추출한 CSRF 토큰 헤더에 추가
      },
    })

    const data: AuthResponse = await response.json()

    const nextResponse = NextResponse.json(data)
    // 백엔드에서 받은 Set-Cookie 헤더 (세션 쿠키를 만료시키는 내용)를 그대로 클라이언트에 전달합니다.
    const setCookieHeaders = response.headers.getSetCookie()
    if (setCookieHeaders) {
      setCookieHeaders.forEach(cookie => {
        nextResponse.headers.append("Set-Cookie", cookie)
      })
    }

    return nextResponse
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json(
      { status: "error", code: 500, message: "서버 오류가 발생했습니다." } as AuthResponse,
      { status: 500 }
    )
  }
}