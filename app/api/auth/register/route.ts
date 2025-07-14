import { NextResponse, type NextRequest } from "next/server"
import { type AuthResponse, type User, UserRole } from "@/types/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const XSRFToken = request.headers.get("X-XSRF-TOKEN") || "";
    const cookie = request.headers.get("cookie");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup`, {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Register error:", error)
    return Response.json(
      {
        status: "error",
        code: 500,
        message: "서버 오류가 발생했습니다."
      } as AuthResponse
    )
  }
}
