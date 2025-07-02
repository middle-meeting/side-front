export enum UserRole {
  STUDENT = "STUDENT",
  PROFESSOR = "PROFESSOR",
}

export interface User {
  id: number
  username: string
  name: string
  role: UserRole
  school?: string
  major?: string
  grade?: number // 학년 (학생만)
  studentId?: string // 학번 (학생만)
  employeeId?: string // 직번 (교수만)
}

export interface StudentRegisterRequest {
  username: string
  password: string
  role: UserRole
  name: string
  school: string
  major: string
  grade: number
  studentId: string
  verificationCode: string
}

export interface ProfessorRegisterRequest {
  username: string
  password: string
  role: UserRole
  name: string
  school: string
  major: string
  grade: number
  studentId: string
  verificationCode: string
  // name: string
  // school: string
  // major: string
  // employeeId: string
  // email: string
  // verificationCode: string
  // password: string
  // confirmPassword: string
}

export interface LoginRequest {
  username: string
  password: string
  // role: UserRole
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
  status: string
  code: number
  message: string
  data?: User
}

export interface EmailVerificationResponse {
  status: string
  code: number
  message: string
  data?: {
    message: string
  }
}

export interface CsrfToken {
    token: string
    headerName: string
    parameterName: string
}

export interface CsrfTokenResponse {
  status: string
  code: number
  message: string
  data?: CsrfToken
  error?: string
}