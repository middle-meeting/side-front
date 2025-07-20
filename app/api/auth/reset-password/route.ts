import type { NextRequest } from "next/server"
import type { PasswordResetRequest, AuthResponse } from "@/types/auth"

export async function POST(request: NextRequest) {
  try {
    const body: PasswordResetRequest = await request.json()
    const { email, name } = body

    // 로딩 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 목업 사용자 확인
    const mockUsers = [
      { email: "student@medical.edu", name: "김의대" },
      { email: "professor@medical.edu", name: "이진료" },
    ]

    const user = mockUsers.find((u) => u.email === email && u.name === name)

    if (!user) {
      return Response.json(
        {
          status: "error",
          code: 404,
          success: false,
          message: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
        } as AuthResponse
      )
    }

    // 임시 비밀번호 생성 및 이메일 전송 (목업)
    const tempPassword = Math.random().toString(36).slice(-8)
    console.log(`[목업] ${email}로 임시 비밀번호 전송: ${tempPassword}`)

    return Response.json({
      success: true,
      message: "임시 비밀번호가 이메일로 전송되었습니다.",
    } as AuthResponse)
  } catch (error) {
    console.error("Password reset error:", error)
    return Response.json(
      {
        status: "error",
        code: 500,
        success: false,
        message: "서버 오류가 발생했습니다.",
      } as AuthResponse
    )
  }
}
