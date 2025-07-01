import { CsrfTokenResponse } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { "cookie": cookie } : {}),
      },
    });

    // Set-Cookie 헤더를 백엔드에서 받아옴
    const setCookie = res.headers.get("set-cookie");

    const data: CsrfTokenResponse = await res.json();

    // Next.js 응답에 Set-Cookie 헤더를 수동으로 실어줌
    const nextRes = NextResponse.json(data);
    if (setCookie) {
      nextRes.headers.set("set-cookie", setCookie);
    }
    return nextRes;
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        code: 500,
        message: "CSRF 토큰을 가져오는 중 오류가 발생했습니다.",
      } as CsrfTokenResponse
    );
  }
}
