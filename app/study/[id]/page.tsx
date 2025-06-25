"use client"

import type React from "react"
import Link from "next/link"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Send,
  Loader2,
  User,
  Bot,
  Calendar,
  Clock,
  GraduationCap,
  Stethoscope,
  FileText,
  ArrowLeft,
  CheckCircle,
  X,
  Plus,
  Trash2,
} from "lucide-react"

// 타입 정의
enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

interface StudentAssignmentDetailResponseDto {
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

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
}

interface DiagnosisSubmission {
  primaryDiagnosis: string
  secondaryDiagnosis: string
  prescriptions: Prescription[]
  additionalTests: string
  patientEducation: string
  followUpPlan: string
  clinicalReasoning: string
}

// Badge 컴포넌트
function Badge({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "destructive"
}) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
  const variantClasses =
    variant === "destructive" ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"

  return <div className={`${baseClasses} ${variantClasses} ${className}`}>{children}</div>
}

// 샘플 데이터 (실제로는 params.id로 해당 과제 데이터를 가져올 것)
const sampleAssignment: StudentAssignmentDetailResponseDto = {
  id: 1,
  title: "급성 복통 환자 진료 실습",
  personaName: "김영희",
  personaAge: 45,
  personaGender: GenderType.FEMALE,
  personaSymptom: "오른쪽 하복부 통증, 발열, 구토",
  personaHistory: "고혈압 약물 복용 중, 2년 전 담낭절제술 시행",
  maxTurns: 20,
  dueDate: "2024-01-15T23:59:00",
  courseName: "내과학 실습",
  semester: "2024-1학기",
  professorName: "이진료",
}

export default function StudyPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 진찰결과 폼 상태
  const [diagnosisForm, setDiagnosisForm] = useState<DiagnosisSubmission>({
    primaryDiagnosis: "",
    secondaryDiagnosis: "",
    prescriptions: [{ id: "1", medication: "", dosage: "", frequency: "", duration: "" }],
    additionalTests: "",
    patientEducation: "",
    followUpPlan: "",
    clinicalReasoning: "",
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // 초기 환자 인사말
    const initialMessage: ChatMessage = {
      id: "1",
      role: "assistant",
      content: `안녕하세요, 저는 ${sampleAssignment.personaName}입니다. ${sampleAssignment.personaSymptom} 때문에 병원에 왔어요. 많이 아파서 걱정이 되네요...`,
      timestamp: new Date(),
    }
    setMessages([initialMessage])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || currentTurn >= sampleAssignment.maxTurns || isSubmitted) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setCurrentTurn((prev) => prev + 1)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          patientInfo: sampleAssignment,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const addPrescription = () => {
    const newPrescription: Prescription = {
      id: Date.now().toString(),
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
    }
    setDiagnosisForm((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, newPrescription],
    }))
  }

  const removePrescription = (id: string) => {
    setDiagnosisForm((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((p) => p.id !== id),
    }))
  }

  const updatePrescription = (id: string, field: keyof Prescription, value: string) => {
    setDiagnosisForm((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }))
  }

  const handleSubmitAssignment = async () => {
    try {
      // 실제로는 서버에 과제 제출 API 호출 (진찰결과 포함)
      console.log("제출된 진찰결과:", diagnosisForm)

      setIsSubmitted(true)
      setShowSubmitForm(false)

      // 제출 완료 메시지 추가
      const submitMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "과제와 진찰결과가 성공적으로 제출되었습니다. 교수님의 채점을 기다려주세요.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, submitMessage])
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getGenderText = (gender: GenderType) => {
    return gender === GenderType.MALE ? "남성" : "여성"
  }

  const canSubmit = currentTurn > 0 && !isSubmitted

  const isFormValid = () => {
    return (
      diagnosisForm.primaryDiagnosis.trim() !== "" &&
      diagnosisForm.clinicalReasoning.trim() !== "" &&
      diagnosisForm.prescriptions.some((p) => p.medication.trim() !== "")
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">의료교육 플랫폼</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">강의 목록</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="text-blue-600">
                  환자 시뮬레이션
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)] bg-white">
        {/* 메인 채팅 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 헤더 */}
          <div className="border-b border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{sampleAssignment.title}</h1>
                <p className="text-sm text-gray-600">
                  환자: {sampleAssignment.personaName} ({sampleAssignment.personaAge}세,{" "}
                  {getGenderText(sampleAssignment.personaGender)})
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isSubmitted && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    제출 완료
                  </Badge>
                )}
                <Link href="/courses/1">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    과제 목록으로
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto">
            {messages.map((message) => {
              const isUser = message.role === "user"
              return (
                <div key={message.id} className={`flex gap-3 p-4 ${isUser ? "bg-white" : "bg-gray-50"}`}>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{isUser ? "학생" : sampleAssignment.personaName}</span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div className="flex gap-3 p-4 bg-gray-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{sampleAssignment.personaName}</div>
                  <div className="text-sm text-gray-600">입력 중...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="border-t border-gray-200 p-4 bg-white">
            {!isSubmitted ? (
              <>
                <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      currentTurn >= sampleAssignment.maxTurns
                        ? "최대 대화 턴에 도달했습니다."
                        : "환자에게 질문하거나 진료를 진행하세요..."
                    }
                    disabled={isLoading || currentTurn >= sampleAssignment.maxTurns}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim() || currentTurn >= sampleAssignment.maxTurns}
                    size="icon"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    대화 턴: {currentTurn}/{sampleAssignment.maxTurns}
                  </div>

                  {/* 제출 버튼 */}
                  {canSubmit && (
                    <Button
                      onClick={() => setShowSubmitForm(true)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      진찰결과 작성 및 제출
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">과제가 제출되었습니다</span>
                </div>
                <p className="text-sm text-gray-600">교수님의 채점을 기다려주세요.</p>
              </div>
            )}
          </div>
        </div>

        {/* 사이드바 */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 space-y-4 overflow-y-auto">
          {/* 과제 정보 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                과제 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-gray-600">과제명</h3>
                <p className="text-sm">{sampleAssignment.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">강의</h3>
                  <p className="text-sm">{sampleAssignment.courseName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">학기</h3>
                  <p className="text-sm">{sampleAssignment.semester}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">담당교수</h3>
                <p className="text-sm">{sampleAssignment.professorName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">마감: {formatDate(sampleAssignment.dueDate)}</span>
              </div>
            </CardContent>
          </Card>

          {/* 환자 정보 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                환자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{sampleAssignment.personaName}</h3>
                  <p className="text-sm text-gray-600">{sampleAssignment.personaAge}세</p>
                </div>
                <Badge
                  className={
                    sampleAssignment.personaGender === GenderType.MALE
                      ? "bg-blue-100 text-blue-800"
                      : "bg-pink-100 text-pink-800"
                  }
                >
                  {getGenderText(sampleAssignment.personaGender)}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-600 flex items-center gap-1">
                  <Stethoscope className="w-4 h-4" />
                  주요 증상
                </h3>
                <p className="text-sm mt-1 p-2 bg-red-50 rounded border-l-4 border-red-200">
                  {sampleAssignment.personaSymptom}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  병력
                </h3>
                <p className="text-sm mt-1 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                  {sampleAssignment.personaHistory}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 진행 상황 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                진행 상황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">대화 턴</span>
                  <Badge variant={currentTurn >= sampleAssignment.maxTurns ? "destructive" : "default"}>
                    {currentTurn} / {sampleAssignment.maxTurns}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isSubmitted
                        ? "bg-green-500"
                        : currentTurn >= sampleAssignment.maxTurns
                          ? "bg-red-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min((currentTurn / sampleAssignment.maxTurns) * 100, 100)}%` }}
                  />
                </div>
                {isSubmitted ? (
                  <p className="text-xs text-green-600 mt-2">과제가 제출되었습니다.</p>
                ) : currentTurn >= sampleAssignment.maxTurns ? (
                  <p className="text-xs text-red-600 mt-2">최대 대화 턴에 도달했습니다.</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 진찰결과 작성 모달 */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">진찰결과 및 처방 작성</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSubmitForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">환자와의 대화를 바탕으로 진단과 치료 계획을 작성해주세요.</p>
            </div>

            <div className="p-6 space-y-6">
              {/* 진단 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">진단</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-diagnosis">주 진단 *</Label>
                    <Input
                      id="primary-diagnosis"
                      value={diagnosisForm.primaryDiagnosis}
                      onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, primaryDiagnosis: e.target.value }))}
                      placeholder="예: 급성 충수염 (K35.9)"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary-diagnosis">부 진단</Label>
                    <Input
                      id="secondary-diagnosis"
                      value={diagnosisForm.secondaryDiagnosis}
                      onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, secondaryDiagnosis: e.target.value }))}
                      placeholder="예: 고혈압 (I10)"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* 처방 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">처방</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addPrescription}>
                    <Plus className="w-4 h-4 mr-1" />
                    처방 추가
                  </Button>
                </div>

                {diagnosisForm.prescriptions.map((prescription, index) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">처방 {index + 1}</h4>
                      {diagnosisForm.prescriptions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrescription(prescription.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <Label htmlFor={`medication-${prescription.id}`}>약물명</Label>
                        <Input
                          id={`medication-${prescription.id}`}
                          value={prescription.medication}
                          onChange={(e) => updatePrescription(prescription.id, "medication", e.target.value)}
                          placeholder="예: 아목시실린"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`dosage-${prescription.id}`}>용량</Label>
                        <Input
                          id={`dosage-${prescription.id}`}
                          value={prescription.dosage}
                          onChange={(e) => updatePrescription(prescription.id, "dosage", e.target.value)}
                          placeholder="예: 500mg"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`frequency-${prescription.id}`}>복용법</Label>
                        <Input
                          id={`frequency-${prescription.id}`}
                          value={prescription.frequency}
                          onChange={(e) => updatePrescription(prescription.id, "frequency", e.target.value)}
                          placeholder="예: 1일 3회"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`duration-${prescription.id}`}>복용기간</Label>
                        <Input
                          id={`duration-${prescription.id}`}
                          value={prescription.duration}
                          onChange={(e) => updatePrescription(prescription.id, "duration", e.target.value)}
                          placeholder="예: 7일간"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 추가 검사 */}
              <div>
                <Label htmlFor="additional-tests">추가 검사 계획</Label>
                <Textarea
                  id="additional-tests"
                  value={diagnosisForm.additionalTests}
                  onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, additionalTests: e.target.value }))}
                  placeholder="필요한 추가 검사가 있다면 작성해주세요. (예: 복부 CT, 혈액검사 등)"
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* 환자 교육 */}
              <div>
                <Label htmlFor="patient-education">환자 교육 및 생활 지도</Label>
                <Textarea
                  id="patient-education"
                  value={diagnosisForm.patientEducation}
                  onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, patientEducation: e.target.value }))}
                  placeholder="환자에게 제공할 교육 내용과 생활 지도사항을 작성해주세요."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* 추후 관리 계획 */}
              <div>
                <Label htmlFor="follow-up-plan">추후 관리 계획</Label>
                <Textarea
                  id="follow-up-plan"
                  value={diagnosisForm.followUpPlan}
                  onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, followUpPlan: e.target.value }))}
                  placeholder="재진 일정, 경과 관찰 계획 등을 작성해주세요."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* 임상적 근거 */}
              <div>
                <Label htmlFor="clinical-reasoning">임상적 근거 및 판단 과정 *</Label>
                <Textarea
                  id="clinical-reasoning"
                  value={diagnosisForm.clinicalReasoning}
                  onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, clinicalReasoning: e.target.value }))}
                  placeholder="진단에 이른 임상적 근거와 판단 과정을 상세히 설명해주세요."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">* 표시된 항목은 필수 입력 사항입니다.</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowSubmitForm(false)}>
                    취소
                  </Button>
                  <Button onClick={handleSubmitAssignment} disabled={!isFormValid()}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    과제 제출
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
