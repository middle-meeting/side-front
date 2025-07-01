import { CsrfTokenResponse } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try{
        const cookie = request.headers.get("cookie");
        console.log(cookie);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf`,{
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            ...(cookie ? { "cookie": cookie } : {}),
            credentials: "include"
        })
        console.log(response);
        const data: CsrfTokenResponse = await response.json();
        console.log(data);
        return NextResponse.json(data);
    }catch (error){
        return NextResponse.json(
           {
                status: "error",
                code: 500,
                message: "CSRF 토큰을 가져오는 중 오류가 발생했습니다.",
           } as CsrfTokenResponse
        )
    }
}