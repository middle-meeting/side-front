import type { NextRequest } from "next/server"
import { type LoginRequest, type AuthResponse, type User, UserRole } from "@/types/auth"

// 목업 사용자 데이터
const mockUsers: User[] = [
  {
    id: 1,
    name: "김의대",
    email: "student@medical.edu",
    role: UserRole.STUDENT,
    studentId: "2024001",
    department: "의학과",
  },
  {
    id: 2,
    name: "이진료",
    email: "professor@medical.edu",
    role: UserRole.PROFESSOR,
    employeeId: "P001",
    department: "내과학교실",
  },
  {
    id: 3,
    name: "박수술",
    email: "surgeon@medical.edu",
    role: UserRole.PROFESSOR,
    employeeId: "P002",
    department: "외과학교실",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password, role } = body

    // 로딩 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 목업 인증 로직
    const user = mockUsers.find((u) => u.email === email && u.role === role)

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "이메일 또는 역할이 올바르지 않습니다.",
        } as AuthResponse,
        { status: 401 },
      )
    }

    // 간단한 비밀번호 검증 (실제로는 해시 비교)
    if (password !== "password123") {
      return Response.json(
        {
          success: false,
          message: "비밀번호가 올바르지 않습니다.",
        } as AuthResponse,
        { status: 401 },
      )
    }

    // 성공 응답
    return Response.json({
      success: true,
      message: "로그인에 성공했습니다.",
      user,
      token: `mock-token-${user.id}-${Date.now()}`,
    } as AuthResponse)
  } catch (error) {
    console.error("Login error:", error)
    return Response.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
      } as AuthResponse,
      { status: 500 },
    )
  }
}
