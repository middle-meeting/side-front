export interface Assignment {
  id: number
  title: string
  description: string
  dueDate: string
  createdDate: string
  status: "grading_required" | "graded_private" | "graded_public"
  studentStats: {
    notStarted: number
    inProgress: number
    submitted: number
    graded: number
  }
  totalStudents: number
}

export enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export interface AssignmentCreateDto {
  title: string
  personaName: string
  personaAge: number
  personaGender: GenderType
  personaSymptom: string
  personaHistory: string
  personaPersonality: string
  personaDisease: string
  objective: string
  maxTurns: number
  dueDate: string
}

export interface PatientInfo {
  name: string
  age: number
  gender: string
  chiefComplaint: string
  presentIllness: string
  pastHistory: string
  familyHistory: string
  socialHistory: string
  vitalSigns: {
    bloodPressure: string
    heartRate: string
    temperature: string
    respiratoryRate: string
    oxygenSaturation: string
  }
  physicalExam: string
  labResults: string
  imagingResults: string
}

export interface ChatMessage {
  id: number
  sender: "student" | "patient"
  message: string
  timestamp: string
}

export interface StudentSubmission {
  diagnosis: string
  prescription: string
  reasoning: string
  chatHistory: ChatMessage[]
  submittedAt: string
}

export interface GradingCriteria {
  diagnosis: {
    score: number
    maxScore: number
    feedback: string
  }
  prescription: {
    score: number
    maxScore: number
    feedback: string
  }
  communication: {
    score: number
    maxScore: number
    feedback: string
  }
  reasoning: {
    score: number
    maxScore: number
    feedback: string
  }
}

export interface StudentGrade {
  studentId: number
  studentName: string
  submission: StudentSubmission
  grading: GradingCriteria
  totalScore: number
  maxTotalScore: number
  overallFeedback: string
  gradedAt: string
}
