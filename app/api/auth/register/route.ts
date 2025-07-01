import type { NextRequest } from "next/server"
import { type AuthResponse, type User, UserRole } from "@/types/auth"

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup`, request);
    const data: AuthResponse = await response.json();
    return data as AuthResponse;
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
