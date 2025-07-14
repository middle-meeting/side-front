"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthResponse, EmailVerificationResponse, CsrfToken } from "@/types/auth"
import type { RegisterFormValues } from "@/lib/validators/auth"

// CSRF 토큰을 인자로 받도록 수정
async function fetchApi(url: string, method: string, body: any, csrfToken?: CsrfToken | null) {
  if (!csrfToken) {
    throw new Error("CSRF token is not available.")
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      [csrfToken.headerName]: csrfToken.token,
    },
    body: JSON.stringify(body),
    credentials: "include",
  })

  return response.json()
}

export function useRegister() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (data: RegisterFormValues, csrfToken?: CsrfToken | null) => {
    setIsLoading(true)
    setError(null)
    try {
      const result: AuthResponse = await fetchApi("/api/auth/register", "POST", data, csrfToken)
      if (result.code === 200) {
        router.push("/login")
      } else {
        setError(result.message)
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error }
}

export function useSendVerification() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutate = async (email: string, csrfToken?: CsrfToken | null) => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)
    try {
      const result: EmailVerificationResponse = await fetchApi("/api/auth/send-verification", "POST", { email }, csrfToken)
      if (result.code === 200) {
        setIsSuccess(true)
      } else {
        setError(result.message)
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error, isSuccess }
}

export function useVerifyCode() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutate = async (data: { email: string; verificationCode: string }, csrfToken?: CsrfToken | null) => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)
    try {
      const result: AuthResponse = await fetchApi("/api/auth/verify-code", "POST", data, csrfToken)
      if (result.code === 200) {
        setIsSuccess(true)
      } else {
        setError(result.message)
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error, isSuccess }
}
