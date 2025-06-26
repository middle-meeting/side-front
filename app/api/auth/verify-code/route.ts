import type { NextRequest } from "next/server"

interface VerifyCodeRequest {
  email: string
  code: string
}

interface VerifyCodeResponse {
  success: boolean
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyCodeRequest = await request.json()
    const { email, code } = body

    // 로딩 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 목업 인증번호 확인 (실제로는 DB에서 확인)
    if (code === "123456") {
      return Response.json({
        success: true,
        message: "이메일 인증이 완료되었습니다.",
      } as VerifyCodeResponse)
    } else {
      return Response.json(
        {
          success: false,
          message: "인증번호가 올바르지 않습니다.",
        } as VerifyCodeResponse,
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Verify code error:", error)
    return Response.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
      } as VerifyCodeResponse,
      { status: 500 },
    )
  }
}
