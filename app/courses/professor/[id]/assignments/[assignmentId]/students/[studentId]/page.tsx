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
  FileText,
  MessageSquare,
  Stethoscope,
  Pill,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Award,
  GraduationCap,
  Clock,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

import type {
  ProfessorDiagnosisSubmissionResponseDto as Submission,
  ProfessorAssignmentDetailResponseDto as AssignmentDetail,
  ProfessorEvaluationResponseDto as Evaluation,
  GenderType
} from "@/types/assignmentProfessor"

interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
  error: any;
}

// 채팅 메시지 타입
interface ChatMessage {
  id: string
  turnNumber: number
  speaker: "STUDENT" | "AI"
  message: string
  timestamp: string
  score?: number
  feedback?: string
}

// 환자 정보 타입
interface PatientInfo {
  name: string
  age: number
  gender: "MALE" | "FEMALE"
  symptom: string
  history: string
}

export default function StudentSubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  const courseId = Number.parseInt(params.id as string)
  const assignmentId = Number.parseInt(params.assignmentId as string)
  const studentId = Number.parseInt(params.studentId as string)

  // 채점 상태
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [isGraded, setIsGraded] = useState(false)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [chats, setChats] = useState<ChatMessage[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // 토글 상태
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(true)
  const [isConversationOpen, setIsConversationOpen] = useState(true)

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
    setChats((prev) => 
      prev.map((msg) => msg.id === messageId ? { ...msg, score } : msg),  
    )
  }

  const updateMessageFeedback = (messageId: string, feedback: string) => {
    setChats((prev) => 
      prev.map((msg) => msg.id === messageId ? { ...msg, feedback } : msg),
    )
  }

  const updateFinalScore = (score: number) => {
    setEvaluation((prev) => ({ ...prev, score: score }))
  }

  const updateFinalFeedback = (feedback: string) => {
    setEvaluation((prev) => ({ ...prev, feedback: feedback }))
  }

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await fetch(`/api/professor/courses/${courseId}/assignments/${assignmentId}/students/${studentId}/evaluations`)

        if (!response.ok) {
          throw new Error("Failed to fetch submission's evaluation data")
        }

        const result = await response.json()
        if (result.status === "OK") {
          setIsGraded(true)
          setEvaluation(result.data)
        } else {
          if (result.code === 404) {
            setIsGraded(false)
            setEvaluation({
              score: 0,
              feedback: ""
            } as Evaluation)
            console.log("이전 평가내역 미존재")
          } else {
            throw new Error(result.message || "Failed to fetch chat data")
          }
        }
      } catch (error) {
        console.error("과제 제출내역 조회 실패:", error)
      }
    }

    fetchEvaluation()

    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/professor/assignments/${assignmentId}/students/${studentId}/submissions`)
        if (!response.ok) {
          throw new Error("Failed to fetch submission data")
        }

        const result = await response.json()
        if (result.status === "OK") {
          console.log("fetchSubmission data : ", result.data)
          setSubmission(result.data)
        } else {
          throw new Error(result.message || "Failed to fetch submission data")
        }
      } catch (error) {
        console.error("과제 제출내역 조회 실패:", error)
      }
    }

    fetchSubmission()

    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/professor/courses/${courseId}/assignments/${assignmentId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch assignment data")
        }

        const result = await response.json()
        if (result.status === "OK") {
          setAssignment(result.data)
        } else {
          throw new Error(result.message || "Failed to fetch assignment data")
        }
      } catch (error) {
        console.error("과제정보 조회 실패:", error)
      }
    }

    fetchAssignment()

    const fetchChatMessages = async () => {
      try {
        const response = await fetch(`/api/professor/assignments/${assignmentId}/students/${studentId}/chats`)
        if (!response.ok) {
          throw new Error("Failed to fetch chat data")
        }

        const result = await response.json()
        let fetchedChats: ChatMessage[] = [];
        if (result.status === "OK") {
          fetchedChats = result.data
          fetchedChats = fetchedChats.map((msg) => ({
            ...msg,
            score: msg.score ?? 0,
            feedback: msg.feedback ?? "",
          }))
          setChats(fetchedChats)
        } else {
          if (result.code === 404) {
            setChats([]);
          } else {
            throw new Error(result.message || "Failed to fetch chat data")
          }
        }
      } catch (error) {
        console.error("과제 내 채팅 내역 조회 실패:", error)
      }
    }

    fetchChatMessages()
  }, [courseId, assignmentId, studentId])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const [evaluationResponse, chatEvaluationResponse] = await Promise.all([
        fetch(`/api/professor/courses/${courseId}/assignments/${assignmentId}/students/${studentId}/evaluations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score: evaluation.score,
            feedback: evaluation.feedback,
          }),
          credentials: "include"
        }),
        fetch(`/api/professor/courses/${courseId}/assignments/${assignmentId}/students/${studentId}/evaluations/chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatEvaluationRequestDtoList: chats
              .filter((msg) => msg.speaker === "STUDENT")
              .map((msg) => ({
                id: Number(msg.id),
                score: msg.score ?? 0,
                feedback: msg.feedback ?? ""
              }))
          }),
          credentials: "include"
        }),
      ])
      console.log("EvaluationResponse:", evaluationResponse)
      console.log("ChatEvaluationResponse:", chatEvaluationResponse)

      const [evaluationResult, chatEvaluationResult] = await Promise.all([
        evaluationResponse.json(),
        chatEvaluationResponse.json(),
      ])

      if (evaluationResponse.ok) {
        toast({
          title: "과제 채점 완료",
          description: "과제가 성공적으로 채점됐습니다.",
        })
      } else {
        toast({
          title: "과제 채점 실패",
          description: evaluationResult.error || "과제 채점 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }

      if (chatEvaluationResponse.ok) {
        toast({
          title: "채팅 내역 채점 완료",
          description: "채팅 내역이 성공적으로 채점됐습니다.",
        })
      } else {
        toast({
          title: "채팅 내역 채점 실패",
          description: chatEvaluationResult.error || "채팅 내역 채점 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }

      if (evaluationResponse.ok && chatEvaluationResponse.ok) {
        setIsGraded(true)
        console.log("채점 완료")
      }
    } catch (error) {
      console.error("저장 실패:", error)
      toast({
        title: "과제 채점 실패",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 평균 점수 계산
  const averageMessageScore =
    chats
      .filter((msg) => msg.speaker === "STUDENT" && msg.score)
      .reduce((sum, msg) => sum + (msg.score || 0), 0) /
    chats.filter((msg) => msg.speaker === "STUDENT" && msg.score).length

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

  if (!evaluation || !submission || !assignment || !chats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">과제 제출내역을 불러오는 중...</p>
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
                  {submission.name} ({submission.studentId})
                </p>
              </div>
            </div>

            {/* 학생 네비게이션 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleSave} disabled={isGraded || isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "저장 중..." : "저장"}
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {submission.name} ({submission.studentId})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  제출일: {formatDate(submission.submittedAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isGraded ? (
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
                      value={evaluation.score || ""}
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
                      value={evaluation.feedback || ""}
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
                              {submission.primaryDiagnosis}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">부 진단</Label>
                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                              {submission.subDiagnosis || "없음"}
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
                            {submission.prescriptions.map((prescription, index) => (
                              <div key={prescription.id} className="text-sm p-2 bg-gray-50 rounded">
                                <span className="font-medium">
                                  {index + 1}. {prescription.drugName}
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
                        <Label className="text-sm font-medium text-gray-600">임상적 근거 및 판단 과정</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded min-h-[80px]">
                          {submission.finalJudgement || "없음"}
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
                          {chats.map((message) => {
                            const isUser = message.speaker === "STUDENT"
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
                                        {formatDate(message.timestamp)}
                                      </span>
                                      {isUser && message.score && (
                                        <Badge variant="default" className="ml-auto">
                                          {message.score}/5
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-800">{message.message}</div>
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
                    <h3 className="font-semibold text-lg">{assignment.personaName}</h3>
                    <p className="text-sm text-gray-600">{assignment.personaAge}세</p>
                  </div>
                  <Badge variant="default">{getGenderText(assignment.personaGender)}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-600">주요 증상</h3>
                  <p className="text-sm mt-1 p-2 bg-red-50 rounded border-l-4 border-red-200">
                    {assignment.personaSymptom}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-600">병력</h3>
                  <p className="text-sm mt-1 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                    {assignment.personaHistory}
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
                  <span className="font-semibold">{chats.length}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">최종 점수</span>
                  <span className="font-semibold">
                    {evaluation.score ? `${evaluation.score}/100` : "미입력"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
