import { NextResponse, type NextRequest } from "next/server"

interface VerifyCodeResponse {
  status: string
  code: number
  message: string
  data?: {
    verified: boolean
    message: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const XSRFToken = request.headers.get("X-XSRF-TOKEN") || "";
    const cookie = request.headers.get("cookie");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-XSRF-TOKEN": XSRFToken,
        ...(cookie ? { "cookie": cookie } : {}),
      },
      body: JSON.stringify(body)
    })
    const data: VerifyCodeResponse = await response.json();
    console.log("Verify code response:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Verify code error:", error)
    return Response.json(
      {
        status: "error",
        code: 500,
        message: "서버 오류가 발생했습니다."
      } as VerifyCodeResponse,
    )
  }
}
