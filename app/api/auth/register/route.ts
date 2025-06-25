import type { NextRequest } from "next/server"
import { type RegisterRequest, type AuthResponse, type User, UserRole } from "@/types/auth"

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { name, email, password, confirmPassword, role, studentId, employeeId, department } = body

    // 로딩 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 유효성 검사
    if (password !== confirmPassword) {
      return Response.json(
        {
          success: false,
          message: "비밀번호가 일치하지 않습니다.",
        } as AuthResponse,
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return Response.json(
        {
          success: false,
          message: "비밀번호는 6자 이상이어야 합니다.",
        } as AuthResponse,
        { status: 400 },
      )
    }

    // 이메일 중복 검사 (목업)
    if (email === "student@medical.edu" || email === "professor@medical.edu") {
      return Response.json(
        {
          success: false,
          message: "이미 사용 중인 이메일입니다.",
        } as AuthResponse,
        { status: 409 },
      )
    }

    // 새 사용자 생성 (목업)
    const newUser: User = {
      id: Date.now(), // 실제로는 DB에서 생성된 ID
      name,
      email,
      role,
      studentId: role === UserRole.STUDENT ? studentId : undefined,
      employeeId: role === UserRole.PROFESSOR ? employeeId : undefined,
      department,
    }

    // 성공 응답
    return Response.json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      user: newUser,
      token: `mock-token-${newUser.id}-${Date.now()}`,
    } as AuthResponse)
  } catch (error) {
    console.error("Register error:", error)
    return Response.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
      } as AuthResponse,
      { status: 500 },
    )
  }
}
