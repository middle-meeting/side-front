import { z } from "zod"
import { UserRole } from "@/types/auth"

const passwordSchema = z
  .string()
  .min(6, { message: "비밀번호는 6자 이상이어야 합니다." })
  .max(100, { message: "비밀번호는 100자를 초과할 수 없습니다." })

const baseSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
  school: z.string().min(1, { message: "학교를 입력해주세요." }),
  major: z.string().min(1, { message: "전공을 입력해주세요." }),
  username: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  password: passwordSchema,
  confirmPassword: passwordSchema,
  verificationCode: z.string().length(6, { message: "인증번호는 6자리여야 합니다." }),
})

const studentSchema = baseSchema.extend({
  role: z.literal(UserRole.STUDENT),
  grade: z.coerce.number().min(1).max(4),
  studentId: z.string().min(1, { message: "학번을 입력해주세요." }),
})

const professorSchema = baseSchema.extend({
  role: z.literal(UserRole.PROFESSOR),
  // employeeId: z.string().min(1, { message: "직번을 입력해주세요." }),
})

export const registerSchema = z
  .discriminatedUnion("role", [studentSchema, professorSchema])
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], // 에러 메시지를 confirmPassword 필드에 표시
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
