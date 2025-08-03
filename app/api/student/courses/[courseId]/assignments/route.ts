import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  const cookieHeader = request.headers.get("cookie");
  let xsrfToken = "";

  // 쿠키 헤더에서 XSRF-TOKEN 추출
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const xsrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));
    if (xsrfCookie) {
      xsrfToken = xsrfCookie.substring('XSRF-TOKEN='.length);
    }
  }

  const { courseId } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || 1;
  const status = searchParams.get("status") || "";

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/student/courses/${courseId}/assignments?page=${page}${status ? `&status=${status}` : ""}`;
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookieHeader || "",
        "X-XSRF-TOKEN": xsrfToken,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching assignments list:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
