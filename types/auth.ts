export enum UserRole {
  STUDENT = "STUDENT",
  PROFESSOR = "PROFESSOR",
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  studentId?: string // 학번 (학생인 경우)
  employeeId?: string // 교번 (교수인 경우)
  department?: string
  avatar?: string
}

export interface LoginRequest {
  email: string
  password: string
  role: UserRole
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  studentId?: string
  employeeId?: string
  department?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
}
