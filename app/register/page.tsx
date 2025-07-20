"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormValues } from "@/lib/validators/auth"
import { useRegister, useSendVerification, useVerifyCode } from "@/hooks/use-auth-mutations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  GraduationCap,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Mail,
  Clock,
  RefreshCw,
} from "lucide-react"
import { UserRole, type CsrfToken, type CsrfTokenResponse } from "@/types/auth"

export default function RegisterPage() {
  const [csrfToken, setCsrfToken] = useState<CsrfToken | null>()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.STUDENT,
      name: "",
      school: "",
      major: "",
      username: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
      grade: 1,
      studentId: "",
    },
  })

  const { register, handleSubmit, control, watch, formState: { errors }, getValues, setError } = form
  const selectedRole = watch("role")

  const { mutate: registerUser, isLoading: isRegistering, error: registerError } = useRegister()
  const { mutate: sendVerification, isLoading: isEmailSending, error: sendError, isSuccess: isEmailSent } = useSendVerification()
  const { mutate: verifyCode, isLoading: isCodeVerifying, error: verifyError, isSuccess: isCodeVerifiedSuccess } = useVerifyCode()

  // CSRF 토큰 가져오기
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`/api/auth/csrf`, { credentials: "include" })
        const data: CsrfTokenResponse = await response.json()
        setCsrfToken(data.data)
      } catch (error) {
        setServerError("CSRF 토큰을 가져오는데 실패했습니다. 페이지를 새로고침 해주세요.")
      }
    }
    fetchCsrfToken()
  }, [])

  // 타이머
  useEffect(() => {
    if (isEmailSent && timeLeft === 0) {
        setTimeLeft(180)
    }
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [isEmailSent, timeLeft])

  // 이메일 인증 성공 시 처리
  useEffect(() => {
    if (isCodeVerifiedSuccess) {
      setIsEmailVerified(true)
    }
  }, [isCodeVerifiedSuccess])

  // 서버 에러 통합 관리
  useEffect(() => {
    setServerError(registerError || sendError || verifyError || "")
  }, [registerError, sendError, verifyError])

  const handleSendVerification = () => {
    const email = getValues("username")
    if (!email) {
      setError("username", { type: "manual", message: "이메일을 입력해주세요." })
      return
    }
    sendVerification(email, csrfToken)
  }

  const handleVerifyCode = () => {
    const email = getValues("username")
    const code = getValues("verificationCode")
    if (!code) {
      setError("verificationCode", { type: "manual", message: "인증번호를 입력해주세요." })
      return
    }
    verifyCode({ email, verificationCode: code }, csrfToken)
  }

  const onSubmit = (values: RegisterFormValues) => {
    if (!isEmailVerified) {
      setServerError("이메일 인증을 완료해주세요.")
      return
    }
    registerUser(values, csrfToken)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4"><GraduationCap className="w-12 h-12 text-blue-600" /></div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">의료교육 플랫폼</h1>
          <p className="text-gray-600">새 계정을 만들어보세요</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-center">회원가입</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>역할</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.STUDENT}>학생</SelectItem>
                        <SelectItem value={UserRole.PROFESSOR}>교수</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              <div>
                <Label htmlFor="name">이름</Label>
                <Input id="name" {...register("name")} placeholder="이름을 입력하세요" className="mt-1" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="school">학교</Label>
                <Input id="school" {...register("school")} placeholder="학교명을 입력하세요" className="mt-1" />
                {errors.school && <p className="text-xs text-red-500 mt-1">{errors.school.message}</p>}
              </div>
              <div>
                <Label htmlFor="major">전공</Label>
                <Input id="major" {...register("major")} placeholder="전공을 입력하세요" className="mt-1" />
                {errors.major && <p className="text-xs text-red-500 mt-1">{errors.major.message}</p>}
              </div>
              {selectedRole === UserRole.STUDENT && (
                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    name="grade"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Label>학년</Label>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4].map(g => <SelectItem key={g} value={String(g)}>{g}학년</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  <div>
                    <Label htmlFor="studentId">학번</Label>
                    <Input id="studentId" {...register("studentId")} placeholder="학번" className="mt-1" />
                    {"studentId" in errors && errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId.message}</p>}
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="email">이메일 (아이디)</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="email" type="email" {...register("username")} placeholder="이메일을 입력하세요" disabled={isEmailVerified} />
                  <Button type="button" variant="outline" onClick={handleSendVerification} disabled={!watch('username') || isEmailSending || (timeLeft > 0 && isEmailSent) || isEmailVerified} className="whitespace-nowrap">
                    {isEmailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : isEmailVerified ? <CheckCircle className="w-4 h-4" /> : timeLeft > 0 ? <Clock className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    <span className="ml-1">{isEmailVerified ? "인증완료" : timeLeft > 0 ? formatTime(timeLeft) : "인증번호 전송"}</span>
                  </Button>
                </div>
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
                {isEmailSent && !isEmailVerified && <p className="text-xs text-blue-600 mt-1">인증번호가 이메일로 전송되었습니다.</p>}
              </div>
              {isEmailSent && !isEmailVerified && (
                <div>
                  <Label htmlFor="verificationCode">인증번호</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="verificationCode" {...register("verificationCode")} placeholder="인증번호 6자리" maxLength={6} />
                    <Button type="button" variant="outline" onClick={handleVerifyCode} disabled={!watch('verificationCode') || isCodeVerifying}>{isCodeVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "확인"}</Button>
                    {timeLeft === 0 && <Button type="button" variant="ghost" onClick={handleSendVerification} disabled={isEmailSending} size="sm"><RefreshCw className="w-4 h-4" /></Button>}
                  </div>
                  {errors.verificationCode && <p className="text-xs text-red-500 mt-1">{errors.verificationCode.message}</p>}
                </div>
              )}
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative mt-1">
                  <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} placeholder="비밀번호를 입력하세요" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}</Button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative mt-1">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} placeholder="비밀번호를 다시 입력하세요" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}</Button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>
              {serverError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{serverError}</span>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isRegistering || !isEmailVerified}>
                {isRegistering ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />가입 중...</> : "회원가입"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">이미 계정이 있으신가요? <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">로그인</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
