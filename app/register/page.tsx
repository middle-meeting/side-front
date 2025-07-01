"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Loader2, Eye, EyeOff, AlertCircle, CheckCircle, Mail, Clock, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  type StudentRegisterRequest,
  type ProfessorRegisterRequest,
  UserRole,
  type AuthResponse,
  type EmailVerificationResponse,
  CsrfToken,
  CsrfTokenResponse,
} from "@/types/auth"

type RegisterFormData = StudentRegisterRequest | ProfessorRegisterRequest

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT)
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [formData, setFormData] = useState<RegisterFormData>({
      username: "",
      password: "",
      name: "",
      role: UserRole.STUDENT,
      school: "",
      major: "",
      grade: 1,
      studentId: "",
      verificationCode: ""
  } as StudentRegisterRequest)
  const [csrfToken, setCsrfToken] = useState<CsrfToken | undefined | null>();

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // 이메일 인증 관련 상태
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [isCodeVerifying, setIsCodeVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // 타이머 효과
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  // 역할 변경 시 폼 데이터 초기화
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role)
    if (role === UserRole.STUDENT) {
      setFormData({
        username: "",
        password: "",
        name: "",
        role: UserRole.STUDENT,
        school: "",
        major: "",
        grade: 1,
        studentId: "",
        verificationCode: ""
      } as StudentRegisterRequest)
    } else {
      setFormData({
        username: "",
        password: "",
        name: "",
        role: UserRole.PROFESSOR,
        school: "",
        major: "",
        grade: 1,
        studentId: "",
        verificationCode: ""
        // name: "",
        // school: "",
        // major: "",
        // employeeId: "",
        // email: "",
        // verificationCode: "",
        // password: "",
        // confirmPassword: "",
      } as ProfessorRegisterRequest)
    }
    setIsEmailSent(false)
    setIsEmailVerified(false)
    setTimeLeft(0)
  }

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`/api/auth/csrf`,{
        credentials: "include",
      })
      const data: CsrfTokenResponse = await response.json();
      console.log(data);
      setCsrfToken(data.data);
    }catch (error) {
      setCsrfToken(null);
    }
  }
  
  useEffect(() =>{
    fetchCsrfToken();
  },[])

  // 이메일 인증번호 전송
  const handleSendVerification = async () => {
    if (!formData.username) {
      setError("이메일을 입력해주세요.")
      return
    }

    setIsEmailSending(true)
    setError("")

    try {
      if(!csrfToken) {
        throw new Error("토큰 오류");
      }
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrfToken?.headerName] : csrfToken.token
        },
        body: JSON.stringify({
          email: formData.username
        }),
        credentials: "include"
      })

      const data: EmailVerificationResponse = await response.json()

      if (data.code === 200) {
        setIsEmailSent(true)
        setTimeLeft(180) // 3분
      } else {
        setError(data.message)
      }
    } catch (error) {
      // console.error("Send verification error:", error)
      setError("인증번호 전송 중 오류가 발생했습니다.")
    } finally {
      setIsEmailSending(false)
    }
  }

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      setError("인증번호를 입력해주세요.")
      return
    }

    setIsCodeVerifying(true)
    setError("")

    try {
      if(!csrfToken) {
        throw new Error("토큰 오류");
      }
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrfToken.headerName]: csrfToken.token
        },
        body: JSON.stringify({
          email: formData.username,
          verificationCode: formData.verificationCode,
        }),
      })

      const data = await response.json()

      if (data.code === 200 && data.data?.verified) {
        setIsEmailVerified(true)
      } else {
        setError(data.message)
      }
    } catch (error) {
      // console.error("Verify code error:", error)
      setError("인증번호 확인 중 오류가 발생했습니다.")
    } finally {
      setIsCodeVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 유효성 검사
    if (!isEmailVerified) {
      setError("이메일 인증을 완료해주세요.")
      return
    }

    if (formData.password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.")
      return
    }

    setIsLoading(true)

    try {
      if (!csrfToken) {
        throw new Error("토큰 오류");
      }
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrfToken.headerName]: csrfToken.token,
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          ...formData,
          role: selectedRole,
        }),
      })

      const data: AuthResponse = await response.json()

      if (data.code === 200 && data.data && csrfToken) {
        login(data.data, csrfToken.token)
        router.push("/")
      } else {
        setError(data.message)
      }
    } catch (error) {
      // console.error("Register error:", error)
      setError("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" }
    if (password.length < 6) return { strength: 1, text: "약함", color: "text-red-500" }
    if (password.length < 10) return { strength: 2, text: "보통", color: "text-yellow-500" }
    return { strength: 3, text: "강함", color: "text-green-500" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isFormValid = () => {
    const baseValid =
      formData.name &&
      formData.school &&
      formData.major &&
      formData.username &&
      formData.password &&
      confirmPassword &&
      isEmailVerified

    if (selectedRole === UserRole.STUDENT) {
      const studentData = formData as StudentRegisterRequest
      return baseValid && studentData.studentId && studentData.grade
    } 
    // else {
    //   const professorData = formData as ProfessorRegisterRequest
    //   return baseValid && professorData.employeeId
    // }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">의료교육 플랫폼</h1>
          <p className="text-gray-600">새 계정을 만들어보세요</p>
        </div>

        {/* 회원가입 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">회원가입</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 역할 선택 */}
              <div>
                <Label htmlFor="role">역할</Label>
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="역할을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.STUDENT}>학생</SelectItem>
                    <SelectItem value={UserRole.PROFESSOR}>교수</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 이름 */}
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="이름을 입력하세요"
                  required
                  className="mt-1"
                />
              </div>

              {/* 학교 */}
              <div>
                <Label htmlFor="school">학교</Label>
                <Input
                  id="school"
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
                  placeholder="학교명을 입력하세요"
                  required
                  className="mt-1"
                />
              </div>

              {/* 전공 */}
              <div>
                <Label htmlFor="major">전공</Label>
                <Input
                  id="major"
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData((prev) => ({ ...prev, major: e.target.value }))}
                  placeholder="전공을 입력하세요"
                  required
                  className="mt-1"
                />
              </div>

              {/* 학생 전용 필드 */}
              {selectedRole === UserRole.STUDENT && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="grade">학년</Label>
                      <Select
                        value={(formData as StudentRegisterRequest).grade?.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, grade: Number.parseInt(value) }) as StudentRegisterRequest)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="학년" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1학년</SelectItem>
                          <SelectItem value="2">2학년</SelectItem>
                          <SelectItem value="3">3학년</SelectItem>
                          <SelectItem value="4">4학년</SelectItem>
                          <SelectItem value="5">5학년</SelectItem>
                          <SelectItem value="6">6학년</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="studentId">학번</Label>
                      <Input
                        id="studentId"
                        type="text"
                        value={(formData as StudentRegisterRequest).studentId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, studentId: e.target.value }) as StudentRegisterRequest)
                        }
                        placeholder="학번"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 교수 전용 필드 */}
              {/* {selectedRole === UserRole.PROFESSOR && (
                <div>
                  <Label htmlFor="employeeId">직번</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    value={(formData as ProfessorRegisterRequest).employeeId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, employeeId: e.target.value }) as ProfessorRegisterRequest)
                    }
                    placeholder="직번을 입력하세요"
                    required
                    className="mt-1"
                  />
                </div>
              )} */}

              {/* 이메일 */}
              <div>
                <Label htmlFor="email">이메일 (아이디)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="email"
                    type="email"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, username: e.target.value }))
                      setIsEmailSent(false)
                      setIsEmailVerified(false)
                    }}
                    placeholder="이메일을 입력하세요"
                    required
                    disabled={isEmailVerified}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendVerification}
                    disabled={!formData.username || isEmailSending || (timeLeft > 0 && isEmailSent) || isEmailVerified}
                    className="whitespace-nowrap"
                  >
                    {isEmailSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isEmailVerified ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : timeLeft > 0 ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span className="ml-1">
                      {isEmailVerified ? "인증완료" : timeLeft > 0 ? formatTime(timeLeft) : "인증번호 전송"}
                    </span>
                  </Button>
                </div>
                {isEmailSent && !isEmailVerified && (
                  <p className="text-xs text-blue-600 mt-1">인증번호가 이메일로 전송되었습니다. (목업: 123456)</p>
                )}
              </div>

              {/* 인증번호 입력 */}
              {isEmailSent && !isEmailVerified && (
                <div>
                  <Label htmlFor="verificationCode">인증번호</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="verificationCode"
                      type="text"
                      value={formData.verificationCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, verificationCode: e.target.value }))}
                      placeholder="인증번호 6자리"
                      maxLength={6}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyCode}
                      disabled={!formData.verificationCode || isCodeVerifying}
                    >
                      {isCodeVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "확인"}
                    </Button>
                    {timeLeft === 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSendVerification}
                        disabled={isEmailSending}
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

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
                {formData.password && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          passwordStrength.strength === 1
                            ? "bg-red-500 w-1/3"
                            : passwordStrength.strength === 2
                              ? "bg-yellow-500 w-2/3"
                              : passwordStrength.strength === 3
                                ? "bg-green-500 w-full"
                                : "w-0"
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${passwordStrength.color}`}>{passwordStrength.text}</span>
                  </div>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {confirmPassword && (
                  <div className="mt-1 flex items-center gap-1">
                    {formData.password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-500">비밀번호가 일치합니다</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-500">비밀번호가 일치하지 않습니다</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* 회원가입 버튼 */}
              <Button type="submit" className="w-full" disabled={isLoading || !isFormValid()}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    가입 중...
                  </>
                ) : (
                  "회원가입"
                )}
              </Button>
            </form>

            {/* 로그인 링크 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  로그인
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
