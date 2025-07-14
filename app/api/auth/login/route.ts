import { NextResponse, type NextRequest } from "next/server"
import { type LoginRequest, type AuthResponse} from "@/types/auth"


export async function POST(request: NextRequest) {
  try{
    const body = await request.json();
    const XSRFToken = request.headers.get("X-XSRF-TOKEN") || "";
    const cookie = request.headers.get("cookie");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-XSRF-TOKEN": XSRFToken,
        ...(cookie ? { "cookie": cookie } : {}),
      },
      body: JSON.stringify(body)
    });
    const data: AuthResponse = await response.json();

    const responseHeaders = new Headers(response.headers);
    const setCookie = responseHeaders.get("set-cookie");

    const nextResponse = NextResponse.json(data);
    if (setCookie) {
      nextResponse.headers.set("Set-Cookie", setCookie);
    }
    return nextResponse;
  }catch{
    return Response.json(
      {
        status: "error",
        code: 500,
        message: "로그인 중 오류가 발생했습니다.",
      } as AuthResponse,
    )
  }
}
