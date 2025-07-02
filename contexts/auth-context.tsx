"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { User, AuthResponse } from "@/types/auth"

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data: AuthResponse = await response.json()

      if (response.ok && data.data) {
        setUser(data.data)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // 라우트 보호 로직
  useEffect(() => {
    const publicPaths = ["/login", "/register", "/forgot-password"]
    const isPublicPath = publicPaths.includes(pathname)

    if (!isLoading && !user && !isPublicPath) {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router])

  const login = (user: User) => {
    setUser(user)
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    } catch (error) {
      console.error("Logout failed", error)
    } finally {
      setUser(null)
      // 로그인 페이지 또는 홈으로 리디렉션
      router.push("/login")
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}