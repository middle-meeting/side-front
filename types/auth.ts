export enum UserRole {
  STUDENT = "STUDENT",
  PROFESSOR = "PROFESSOR",
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  school: string
  major: string
  grade?: number // 학년 (학생만)
  studentId?: string // 학번 (학생만)
  employeeId?: string // 직번 (교수만)
  avatar?: string
  isEmailVerified: boolean
}

export interface StudentRegisterRequest {
  name: string
  school: string
  major: string
  grade: number
  studentId: string
  email: string
  verificationCode: string
  password: string
  confirmPassword: string
}

export interface ProfessorRegisterRequest {
  name: string
  school: string
  major: string
  employeeId: string
  email: string
  verificationCode: string
  password: string
  confirmPassword: string
}

export interface LoginRequest {
  email: string
  password: string
  role: UserRole
}

export interface EmailVerificationRequest {
  email: string
  role: UserRole
}

export interface PasswordResetRequest {
  email: string
  name: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
}

export interface EmailVerificationResponse {
  success: boolean
  message: string
  expiresIn?: number // 만료 시간 (초)
}
