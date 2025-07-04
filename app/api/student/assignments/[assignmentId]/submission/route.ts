import { NextResponse, type NextRequest } from "next/server"
import { type DiagnosisSubmission } from "@/types/assignment"

export async function PUT(
  request: NextRequest
) {
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const assignmentId = pathSegments[pathSegments.length - 2]

    if (!assignmentId) {
      return NextResponse.json(
        { message: "URL에서 과제 ID를 찾을 수 없습니다." },
        { status: 400 }
      )
    }

    const body: DiagnosisSubmission = await request.json()
    const cookie = request.headers.get("cookie")
    const xsrfToken = request.headers.get("X-XSRF-TOKEN")

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    }
    if (cookie) {
      headers.Cookie = cookie
    }
    if (xsrfToken) {
      headers["X-XSRF-TOKEN"] = xsrfToken
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/student/assignments/${assignmentId}/submission`,
      {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Submission error:", error)
    return NextResponse.json(
      {
        status: "error",
        code: 500,
        message: "과제 제출 중 오류가 발생했습니다.",
      },
      { status: 500 }
    )
  }
}
