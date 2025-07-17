import { NextResponse, type NextRequest } from "next/server"
import { type AuthResponse } from "@/types/auth"

export async function GET(request: NextRequest) {
  const cookie = request.headers.get("cookie")

  if (!cookie) {
    return NextResponse.json({ status: "error", code: 401, message: "Not authenticated" } as AuthResponse, { status: 401 })
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
      headers: {
        Cookie: cookie,
      },
    })

    const data: AuthResponse = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    console.error("Me API error:", error)
    return NextResponse.json(
      { status: "error", code: 500, message: "서버 오류가 발생했습니다." } as AuthResponse,
      { status: 500 }
    )
  }
}
