import type { NextRequest } from "next/server"
import { type LoginRequest, type AuthResponse} from "@/types/auth"


export async function POST(request: NextRequest) {
  try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, request);
    const data: AuthResponse = await response.json();
    return data as AuthResponse;
  }catch{
    return Response.json(
      {
        status: "error",
        code: 500,
        message: "로그인 중 오류가 발생했습니다.",
      } as AuthResponse,
    )
  }
}
