"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { type LoginRequest, UserRole, type AuthResponse, CsrfToken, CsrfTokenResponse } from "@/types/auth"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [csrfToken, setCsrfToken] = useState<CsrfToken | undefined | null>();

  const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`/api/auth/csrf`,{
          credentials: "include",
        })
        const data: CsrfTokenResponse = await response.json();
        setCsrfToken(data.data);
      }catch (error) {
        setCsrfToken(null);
      }
    }
    
    useEffect(() =>{
      fetchCsrfToken();
    },[])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true);

    try {
      if(!csrfToken) {
        throw new Error("토큰 오류");
      }
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          [csrfToken?.headerName] : csrfToken.token
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      const data: AuthResponse = await response.json()
      console.log(data);
      if (data.code === 200 && data.data && csrfToken) {
        login(data.data)
        router.push("/")
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (role: UserRole) => {
    if (role === UserRole.STUDENT) {
      setFormData({
        username: "student@medical.edu",
        password: "password123",
      })
    } else {
      setFormData({
        username: "professor@medical.edu",
        password: "password123",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">의료교육 플랫폼</h1>
          <p className="text-gray-600">환자 시뮬레이션 학습 시스템</p>
        </div>

        {/* 로그인 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              

              {/* 이메일 */}
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="이메일을 입력하세요"
                  required
                  className="mt-1"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* 로그인 버튼 */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>

              {/* 비밀번호 찾기 링크 */}
              <div className="text-center">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </form>

            {/* 회원가입 링크 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}