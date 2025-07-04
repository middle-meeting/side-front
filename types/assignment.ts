export enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export interface StudentAssignmentDetailResponseDto {
  id: number
  title: string
  personaName: string
  personaAge: number
  personaGender: GenderType
  personaSymptom: string
  personaHistory: string
  maxTurns: number
  dueDate: string
  courseName: string
  semester: string
  professorName: string
}

export interface ChatMessage {
  id: number
  turnNumber: number
  speaker: "STUDENT" | "AI" | "SYSTEM"
  message: string
  timestamp: string
}

export interface ChatResponseData {
  studentMessage: ChatMessage;
  aiMessage: ChatMessage;
}

export interface Prescription {
  id: string // 프론트엔드에서 임시로 사용할 ID
  drugName: string
  dosage: string
  frequency: string
  duration: string
}

export interface DiagnosisSubmission {
  primaryDiagnosis: string
  subDiagnosis: string
  prescriptions: Prescription[]
  finalJudgment: string
}
