"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ArrowLeft,
  BookOpen,
  User,
  Bot,
  Save,
  CheckCircle,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Pill,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Award,
  GraduationCap,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

// 채팅 메시지 타입
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  score?: number
  feedback?: string
}

// 처방 타입
interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
}

// 진단서 타입
interface DiagnosisSubmission {
  primaryDiagnosis: string
  secondaryDiagnosis: string
  prescriptions: Prescription[]
  additionalTests: string
  patientEducation: string
  followUpPlan: string
  clinicalReasoning: string
}

// 환자 정보 타입
interface PatientInfo {
  name: string
  age: number
  gender: "MALE" | "FEMALE"
  symptom: string
  history: string
}

// 학생 제출 정보 타입
interface StudentSubmissionDetail {
  studentId: number
  studentName: string
  studentNumber: string
  assignmentTitle: string
  assignmentDescription: string
  submittedAt: string
  maxTurns: number
  patientInfo: PatientInfo
  messages: ChatMessage[]
  diagnosisSubmission: DiagnosisSubmission
  finalScore?: number
  finalFeedback?: string
  isGraded: boolean
}

// 샘플 데이터
const sampleSubmission: StudentSubmissionDetail = {
  studentId: 1,
  studentName: "김민수",
  studentNumber: "2020123001",
  assignmentTitle: "급성 심근경색 환자 진단",
  assignmentDescription:
    "55세 남성 환자가 급성 흉통을 주소로 응급실에 내원하였습니다. 환자와의 대화를 통해 병력을 청취하고 적절한 진단과 치료 계획을 수립하세요.",
  submittedAt: "2024-01-18T14:30:00",
  maxTurns: 10,
  isGraded: false,
  patientInfo: {
    name: "김철수",
    age: 55,
    gender: "MALE",
    symptom: "급성 흉통, 좌측 팔 방사통, 식은땀",
    history: "고혈압 5년, 흡연 20년 (1갑/일), 음주 주 2-3회, 가족력: 부친 심장병",
  },
  messages: [
    {
      id: "1",
      role: "assistant",
      content:
        "안녕하세요, 저는 김철수입니다. 갑자기 가슴이 너무 아파서 병원에 왔어요. 30분 전부터 가슴 중앙이 쥐어짜는 것처럼 아프고 식은땀이 나네요.",
      timestamp: new Date("2024-01-18T14:00:00"),
    },
    {
      id: "2",
      role: "user",
      content:
        "안녕하세요. 가슴 통증으로 오셨군요. 통증이 언제부터 시작되었고, 어떤 양상인지 자세히 말씀해 주시겠어요?",
      timestamp: new Date("2024-01-18T14:01:00"),
      score: 4,
      feedback: "좋은 시작입니다. 통증의 시작 시점과 양상을 파악하는 것은 중요한 질문입니다.",
    },
    {
      id: "3",
      role: "assistant",
      content:
        "30분 전에 갑자기 시작되었어요. 가슴 정중앙이 무언가로 꽉 눌리는 것 같고, 왼쪽 팔까지 저려요. 숨쉬기도 힘들고 식은땀이 계속 나네요.",
      timestamp: new Date("2024-01-18T14:02:00"),
    },
    {
      id: "4",
      role: "user",
      content:
        "심각한 증상이네요. 과거에 심장 질환이나 고혈압, 당뇨병 등의 병력이 있으신가요? 또한 흡연이나 음주는 하시나요?",
      timestamp: new Date("2024-01-18T14:03:00"),
      score: 5,
      feedback: "위험인자를 체계적으로 확인하는 훌륭한 질문입니다. 심근경색 진단에 필수적인 정보를 수집하고 있습니다.",
    },
    {
      id: "5",
      role: "assistant",
      content:
        "고혈압 약을 5년째 먹고 있어요. 담배는 하루에 한 갑씩 20년 넘게 피웠고, 술은 주 2-3회 정도 마십니다. 아버지도 심장병으로 돌아가셨어요.",
      timestamp: new Date("2024-01-18T14:04:00"),
    },
    {
      id: "6",
      role: "user",
      content:
        "위험 인자가 많으시네요. 지금 즉시 심전도 검사와 혈액검사를 시행하겠습니다. 응급실에서 심장내과 전문의 진료를 받으셔야 할 것 같습니다.",
      timestamp: new Date("2024-01-18T14:05:00"),
      score: 5,
      feedback:
        "적절한 응급처치 계획입니다. 급성 심근경색이 의심되는 상황에서 신속한 검사와 전문의 진료 의뢰가 적절합니다.",
    },
  ],
  diagnosisSubmission: {
    primaryDiagnosis: "급성 심근경색 (I21.9)",
    secondaryDiagnosis: "고혈압 (I10)",
    prescriptions: [
      {
        id: "1",
        medication: "아스피린",
        dosage: "100mg",
        frequency: "1일 1회",
        duration: "지속적",
      },
      {
        id: "2",
        medication: "클로피도그렐",
        dosage: "75mg",
        frequency: "1일 1회",
        duration: "12개월",
      },
    ],
    additionalTests: "관상동맥 조영술, 심초음파, 지질검사",
    patientEducation: "금연 필수, 저염식이, 규칙적인 운동",
    followUpPlan: "1주 후 외래 재진, 3개월마다 정기 검진",
    clinicalReasoning:
      "55세 남성, 흉통 + 좌측 팔 방사통 + 식은땀 + 고혈압/흡연 병력으로 급성 심근경색 강력 의심. 즉시 응급처치 및 관상동맥 중재술 필요.",
  },
  finalScore: 88,
  finalFeedback:
    "전반적으로 환자와의 소통이 좋았고, 급성 심근경색에 대한 기본적인 지식을 잘 활용했습니다. 위험인자 확인과 응급처치 계획이 적절했습니다. 다만, 통증의 방사 양상에 대해 더 자세히 물어볼 수 있었고, 니트로글리세린 투여 여부도 확인해볼 필요가 있었습니다.",
}

// 다른 학생들 목록 (네비게이션용)
const otherStudents = [
  { id: 1, name: "김민수", status: "needs_grading" },
  { id: 2, name: "이지영", status: "needs_grading" },
  { id: 4, name: "최서연", status: "graded" },
  { id: 5, name: "정현우", status: "needs_grading" },
  { id: 7, name: "윤태영", status: "graded" },
  { id: 8, name: "강민지", status: "needs_grading" },
]

export default function StudentSubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const courseId = Number.parseInt(params.id as string)
  const assignmentId = Number.parseInt(params.assignmentId as string)
  const studentId = Number.parseInt(params.studentId as string)

  // 채점 상태
  const [submission, setSubmission] = useState<StudentSubmissionDetail>(sampleSubmission)
  const [isSaving, setIsSaving] = useState(false)

  // 토글 상태
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(true)
  const [isConversationOpen, setIsConversationOpen] = useState(true)

  // 현재 학생의 인덱스 찾기
  const currentStudentIndex = otherStudents.findIndex((s) => s.id === studentId)
  const canGoPrevious = currentStudentIndex > 0
  const canGoNext = currentStudentIndex < otherStudents.length - 1

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getGenderText = (gender: "MALE" | "FEMALE") => {
    return gender === "MALE" ? "남성" : "여성"
  }

  const updateMessageScore = (messageId: string, score: number) => {
    setSubmission((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) => (msg.id === messageId ? { ...msg, score } : msg)),
    }))
  }

  const updateMessageFeedback = (messageId: string, feedback: string) => {
    setSubmission((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)),
    }))
  }

  const updateFinalScore = (score: number) => {
    setSubmission((prev) => ({ ...prev, finalScore: score }))
  }

  const updateFinalFeedback = (feedback: string) => {
    setSubmission((prev) => ({ ...prev, finalFeedback: feedback }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 실제로는 서버에 저장 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("채점 결과 저장:", submission)
    } catch (error) {
      console.error("저장 실패:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleComplete = async () => {
    setIsSaving(true)
    try {
      // 채점 완료 처리
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmission((prev) => ({ ...prev, isGraded: true }))
      console.log("채점 완료:", submission)
    } catch (error) {
      console.error("완료 처리 실패:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const navigateToStudent = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? currentStudentIndex - 1 : currentStudentIndex + 1
    const newStudentId = otherStudents[newIndex].id
    router.push(`/courses/professor/${courseId}/assignments/${assignmentId}/students/${newStudentId}`)
  }

  // 평균 점수 계산
  const averageMessageScore =
    submission.messages
      .filter((msg) => msg.role === "user" && msg.score)
      .reduce((sum, msg) => sum + (msg.score || 0), 0) /
    submission.messages.filter((msg) => msg.role === "user" && msg.score).length

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "PROFESSOR")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "PROFESSOR") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/courses/professor/${courseId}/assignments/${assignmentId}`}>
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  수행현황
                </Button>
              </Link>
              <GraduationCap className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">과제 채점</h1>
                <p className="text-sm text-gray-600">
                  {submission.studentName} ({submission.studentNumber})
                </p>
              </div>
            </div>

            {/* 학생 네비게이션 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateToStudent("prev")} disabled={!canGoPrevious}>
                  <ChevronLeft className="w-4 h-4" />
                  이전
                </Button>
                <span className="text-sm text-gray-600">
                  {currentStudentIndex + 1} / {otherStudents.length}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateToStudent("next")} disabled={!canGoNext}>
                  다음
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "저장 중..." : "저장"}
                </Button>
                <Button onClick={handleComplete} disabled={isSaving || submission.isGraded}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {submission.isGraded ? "채점완료" : "채점완료 처리"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 과제 정보 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{submission.assignmentTitle}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {submission.studentName} ({submission.studentNumber})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  제출일: {formatDate(submission.submittedAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {submission.isGraded ? (
                <Badge className="bg-green-100 text-green-800">채점완료</Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-800">채점필요</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 최종 채점 카드 */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  최종 채점
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="final-score" className="text-sm font-medium">
                      최종 점수 (0-100점)
                    </Label>
                    <Input
                      id="final-score"
                      type="number"
                      min="0"
                      max="100"
                      value={submission.finalScore || ""}
                      onChange={(e) => updateFinalScore(Number.parseInt(e.target.value))}
                      className="mt-1"
                      placeholder="점수 입력"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor="final-feedback" className="text-sm font-medium">
                      총평
                    </Label>
                    <Textarea
                      id="final-feedback"
                      value={submission.finalFeedback || ""}
                      onChange={(e) => updateFinalFeedback(e.target.value)}
                      placeholder="전체적인 평가와 개선점을 작성해주세요..."
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 진단서 섹션 */}
            <Card>
              <Collapsible open={isDiagnosisOpen} onOpenChange={setIsDiagnosisOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        최종 진단서
                      </div>
                      {isDiagnosisOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* 진단 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            진단
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">주 진단</Label>
                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                              {submission.diagnosisSubmission.primaryDiagnosis}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">부 진단</Label>
                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                              {submission.diagnosisSubmission.secondaryDiagnosis || "없음"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Pill className="w-4 h-4" />
                            처방
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {submission.diagnosisSubmission.prescriptions.map((prescription, index) => (
                              <div key={prescription.id} className="text-sm p-2 bg-gray-50 rounded">
                                <span className="font-medium">
                                  {index + 1}. {prescription.medication}
                                </span>
                                <span className="text-gray-600 ml-2">
                                  {prescription.dosage} {prescription.frequency} {prescription.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 추가 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">추가 검사</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded min-h-[80px]">
                          {submission.diagnosisSubmission.additionalTests || "없음"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">환자 교육</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded min-h-[80px]">
                          {submission.diagnosisSubmission.patientEducation || "없음"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">추후 관리 계획</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded min-h-[80px]">
                          {submission.diagnosisSubmission.followUpPlan || "없음"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">임상적 근거</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded min-h-[80px]">
                          {submission.diagnosisSubmission.clinicalReasoning}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* 대화 내용 섹션 */}
            <Card>
              <Collapsible open={isConversationOpen} onOpenChange={setIsConversationOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        대화 내용 및 개별 채점
                        <span className="text-sm text-gray-600 ml-2">
                          (평균 점수: {averageMessageScore ? averageMessageScore.toFixed(1) : "0"}/5)
                        </span>
                      </div>
                      {isConversationOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">각 학생 질문에 대해 점수(1-5점)와 피드백을 입력하세요</p>

                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          {submission.messages.map((message) => {
                            const isUser = message.role === "user"
                            return (
                              <div key={message.id} className={`${isUser ? "ml-8" : ""}`}>
                                {/* 메시지 */}
                                <div className={`flex gap-3 p-4 rounded-lg ${isUser ? "bg-blue-50" : "bg-gray-50"}`}>
                                  <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                      isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                                    }`}
                                  >
                                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm">{isUser ? "학생" : "환자"}</span>
                                      <span className="text-xs text-gray-500">
                                        {message.timestamp.toLocaleTimeString("ko-KR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      {isUser && message.score && (
                                        <Badge variant="default" className="ml-auto">
                                          {message.score}/5
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-800">{message.content}</div>
                                  </div>
                                </div>

                                {/* 학생 발언에 대한 채점 */}
                                {isUser && (
                                  <div className="mt-2 ml-11 p-3 bg-white border border-gray-200 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <Label htmlFor={`score-${message.id}`} className="text-sm font-medium">
                                          점수 (1-5점)
                                        </Label>
                                        <div className="flex items-center gap-1 mt-1">
                                          {[1, 2, 3, 4, 5].map((score) => (
                                            <button
                                              key={score}
                                              onClick={() => updateMessageScore(message.id, score)}
                                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                                message.score === score
                                                  ? "bg-yellow-400 text-white"
                                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                              }`}
                                            >
                                              {score}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="md:col-span-2">
                                        <Label htmlFor={`feedback-${message.id}`} className="text-sm font-medium">
                                          피드백
                                        </Label>
                                        <Textarea
                                          id={`feedback-${message.id}`}
                                          value={message.feedback || ""}
                                          onChange={(e) => updateMessageFeedback(message.id, e.target.value)}
                                          placeholder="이 질문에 대한 피드백을 작성하세요..."
                                          className="mt-1 resize-none"
                                          rows={2}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 환자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  환자 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{submission.patientInfo.name}</h3>
                    <p className="text-sm text-gray-600">{submission.patientInfo.age}세</p>
                  </div>
                  <Badge variant="default">{getGenderText(submission.patientInfo.gender)}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-600">주요 증상</h3>
                  <p className="text-sm mt-1 p-2 bg-red-50 rounded border-l-4 border-red-200">
                    {submission.patientInfo.symptom}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-600">병력</h3>
                  <p className="text-sm mt-1 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                    {submission.patientInfo.history}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 채점 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  채점 통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">총 대화 수</span>
                  <span className="font-semibold">{submission.messages.length}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">학생 발언</span>
                  <span className="font-semibold">
                    {submission.messages.filter((msg) => msg.role === "user").length}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">채점된 발언</span>
                  <span className="font-semibold">
                    {submission.messages.filter((msg) => msg.role === "user" && msg.score).length}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">평균 점수</span>
                  <span className="font-semibold">
                    {averageMessageScore ? `${averageMessageScore.toFixed(1)}/5` : "미채점"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">최종 점수</span>
                  <span className="font-semibold">
                    {submission.finalScore ? `${submission.finalScore}/100` : "미입력"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 다른 학생들 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  다른 학생들
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {otherStudents.map((student) => (
                    <Link
                      key={student.id}
                      href={`/courses/professor/${courseId}/assignments/${assignmentId}/students/${student.id}`}
                    >
                      <div
                        className={`p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                          student.id === studentId
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{student.name}</span>
                          <Badge variant={student.status === "graded" ? "default" : "destructive"} className="text-xs">
                            {student.status === "graded" ? "완료" : "대기"}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
