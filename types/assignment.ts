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
  speaker: "STUDENT" | "AI"
  message: string
  timestamp: string
}

export interface ChatResponseData {
  studentMessage: ChatMessage;
  aiMessage: ChatMessage;
}