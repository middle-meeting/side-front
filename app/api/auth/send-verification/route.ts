import type { NextRequest } from "next/server"
import type { EmailVerificationRequest, EmailVerificationResponse } from "@/types/auth"

export async function POST(request: NextRequest) {
  try {
    const body: EmailVerificationRequest = await request.json()
    const { email, role } = body

    // 로딩 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json(
        {
          success: false,
          message: "올바른 이메일 형식이 아닙니다.",
        } as EmailVerificationResponse,
        { status: 400 },
      )
    }

    // 이메일 중복 검사 (목업)
    if (email === "student@medical.edu" || email === "professor@medical.edu") {
      return Response.json(
        {
          success: false,
          message: "이미 사용 중인 이메일입니다.",
        } as EmailVerificationResponse,
        { status: 409 },
      )
    }

    // 성공 응답 (실제로는 이메일 전송)
    console.log(`[목업] ${email}로 인증번호 전송: 123456`)

    return Response.json({
      success: true,
      message: "인증번호가 이메일로 전송되었습니다.",
      expiresIn: 180, // 3분
    } as EmailVerificationResponse)
  } catch (error) {
    console.error("Email verification error:", error)
    return Response.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
      } as EmailVerificationResponse,
      { status: 500 },
    )
  }
}
