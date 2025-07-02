"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Loader2, AlertCircle, CheckCircle, ArrowLeft, Mail } from "lucide-react"
import type { PasswordResetRequest, AuthResponse } from "@/types/auth"

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<PasswordResetRequest>({
    email: "",
    name: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data: AuthResponse = await response.json()

      if (data.success) {
        setIsSuccess(true)
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Password reset error:", error)
      setError("비밀번호 재설정 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">의료교육 플랫폼</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">이메일 전송 완료</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">임시 비밀번호가 전송되었습니다</h3>
                <p className="text-sm text-gray-600 mb-4">
                  입력하신 이메일 주소로 임시 비밀번호가 전송되었습니다.
                  <br />
                  이메일을 확인하신 후 로그인해주세요.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{formData.email}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/login">
                  <Button className="w-full">로그인 페이지로 이동</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSuccess(false)
                    setFormData({ email: "", name: "" })
                  }}
                >
                  다시 시도
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
          <p className="text-gray-600">비밀번호를 잊으셨나요?</p>
        </div>

        {/* 비밀번호 찾기 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">비밀번호 찾기</CardTitle>
            <p className="text-sm text-gray-600 text-center">
              가입 시 사용한 이메일과 이름을 입력하시면
              <br />
              임시 비밀번호를 이메일로 전송해드립니다.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이메일 */}
              <div>
                <Label htmlFor="email">이메일 (아이디)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="가입 시 사용한 이메일을 입력하세요"
                  required
                  className="mt-1"
                />
              </div>

              {/* 이름 */}
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="가입 시 사용한 이름을 입력하세요"
                  required
                  className="mt-1"
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* 제출 버튼 */}
              <Button type="submit" className="w-full" disabled={isLoading || !formData.email || !formData.name}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    임시 비밀번호 전송
                  </>
                )}
              </Button>
            </form>

            {/* 데모 계정 안내 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">데모 계정 정보</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>학생: student@medical.edu / 김의대</div>
                <div>교수: professor@medical.edu / 이진료</div>
              </div>
            </div>

            {/* 로그인 링크 */}
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                <ArrowLeft className="w-4 h-4 mr-1" />
                로그인 페이지로 돌아가기
              </Link>
            </div>

            {/* 회원가입 링크 */}
            <div className="mt-4 text-center">
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