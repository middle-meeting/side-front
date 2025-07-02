import { NextResponse, type NextRequest } from "next/server"
import type { EmailVerificationRequest, EmailVerificationResponse } from "@/types/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const XSRFToken = request.headers.get("X-XSRF-TOKEN") || "";
    const cookie = request.headers.get("cookie");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup/send-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-XSRF-TOKEN": XSRFToken,
        ...(cookie ? { "cookie": cookie } : {}),
      },
      body: JSON.stringify(body)
    })
    const data : EmailVerificationResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      {
        status: "error",
        code: 500,
        message: "서버 오류가 발생했습니다.",
      } as EmailVerificationResponse
    )
  }
}
