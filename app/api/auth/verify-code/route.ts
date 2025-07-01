import type { NextRequest } from "next/server"

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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup/verify-email`, request)
    const data: VerifyCodeResponse = await response.json();
    return data as VerifyCodeResponse;
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
