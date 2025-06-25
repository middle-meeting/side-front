"use client"

import type React from "react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Bot, Clock, GraduationCap, ArrowLeft, Star, MessageSquare, Award, FileText } from "lucide-react"

// 타입 정의
enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  comment?: string
  score?: number
}

interface GradingResult {
  assignmentId: number
  assignmentTitle: string
  studentName: string
  courseName: string
  professorName: string
  submittedAt: string
  gradedAt: string
  totalScore: number
  maxScore: number
  overallFeedback: string
  messages: ChatMessage[]
  patientInfo: {
    name: string
    age: number
    gender: GenderType
    symptom: string
    history: string
  }
}

// Badge 컴포넌트
function Badge({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "destructive" | "success" | "warning"
}) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
  let variantClasses = ""

  switch (variant) {
    case "destructive":
      variantClasses = "bg-red-100 text-red-800 border-red-200"
      break
    case "success":
      variantClasses = "bg-green-100 text-green-800 border-green-200"
      break
    case "warning":
      variantClasses = "bg-yellow-100 text-yellow-800 border-yellow-200"
      break
    default:
      variantClasses = "bg-blue-100 text-blue-800 border-blue-200"
  }

  return <div className={`${baseClasses} ${variantClasses} ${className}`}>{children}</div>
}

// 샘플 채점 결과 데이터
const sampleGradingResult: GradingResult = {
  assignmentId: 3,
  assignmentTitle: "고혈압 환자 추적관찰",
  studentName: "김의대",
  courseName: "내과학 실습",
  professorName: "이진료",
  submittedAt: "2024-01-08T14:30:00",
  gradedAt: "2024-01-09T10:15:00",
  totalScore: 85,
  maxScore: 100,
  overallFeedback:
    "전반적으로 환자와의 소통이 좋았고, 고혈압 관리에 대한 기본적인 지식을 잘 활용했습니다. 다만, 약물 순응도 개선을 위한 구체적인 방안 제시가 부족했고, 생활습관 교정에 대한 더 자세한 설명이 필요했습니다. 환자의 심리적 상태에 대한 배려도 좋았습니다.",
  patientInfo: {
    name: "최고혈",
    age: 62,
    gender: GenderType.FEMALE,
    symptom: "두통, 어지러움, 목 뒤 뻣뻣함",
    history: "고혈압 진단 5년, 약물 복용 불규칙",
  },
  messages: [
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요, 저는 최고혈입니다. 요즘 머리가 자주 아프고 어지러워서 왔어요.",
      timestamp: new Date("2024-01-08T14:30:00"),
    },
    {
      id: "2",
      role: "user",
      content: "안녕하세요. 언제부터 이런 증상이 있으셨나요?",
      timestamp: new Date("2024-01-08T14:31:00"),
      comment: "좋은 시작입니다. 증상의 시작 시점을 파악하는 것은 중요한 질문입니다.",
      score: 9,
    },
    {
      id: "3",
      role: "assistant",
      content: "한 일주일 정도 된 것 같아요. 특히 아침에 일어날 때 머리가 많이 아파요.",
      timestamp: new Date("2024-01-08T14:31:30"),
    },
    {
      id: "4",
      role: "user",
      content: "현재 복용하고 계신 약이 있나요? 고혈압 약은 잘 드시고 계신가요?",
      timestamp: new Date("2024-01-08T14:32:00"),
      comment: "환자의 기존 병력을 고려한 적절한 질문입니다. 약물 순응도 확인이 중요합니다.",
      score: 10,
    },
    {
      id: "5",
      role: "assistant",
      content: "고혈압 약을 처방받긴 했는데... 솔직히 말하면 자주 깜빡하고 안 먹을 때가 많아요. 괜찮을 줄 알았거든요.",
      timestamp: new Date("2024-01-08T14:32:30"),
    },
    {
      id: "6",
      role: "user",
      content:
        "고혈압 약을 규칙적으로 복용하지 않으시면 혈압이 조절되지 않아서 지금 같은 증상이 나타날 수 있어요. 혈압을 한번 재어보겠습니다.",
      timestamp: new Date("2024-01-08T14:33:00"),
      comment: "약물 순응도와 증상의 연관성을 잘 설명했습니다. 혈압 측정은 적절한 다음 단계입니다.",
      score: 8,
    },
    {
      id: "7",
      role: "assistant",
      content: "네, 알겠습니다. 그런데 약을 매일 먹어야 하나요? 증상이 없을 때도요?",
      timestamp: new Date("2024-01-08T14:33:30"),
    },
    {
      id: "8",
      role: "user",
      content:
        "네, 맞습니다. 고혈압은 '침묵의 살인자'라고 불릴 정도로 증상이 없어도 지속적으로 혈관에 손상을 줍니다. 매일 규칙적으로 복용하셔야 합니다.",
      timestamp: new Date("2024-01-08T14:34:00"),
      comment: "고혈압의 특성을 잘 설명했습니다. 환자 교육이 적절합니다.",
      score: 9,
    },
    {
      id: "9",
      role: "assistant",
      content: "아, 그렇구나요. 그럼 앞으로는 꼭 챙겨 먹을게요. 다른 주의사항도 있나요?",
      timestamp: new Date("2024-01-08T14:34:30"),
    },
    {
      id: "10",
      role: "user",
      content:
        "식단 관리도 중요합니다. 짠 음식을 줄이시고, 규칙적인 운동도 도움이 됩니다. 다음 진료 때까지 혈압을 기록해 보시는 것도 좋겠어요.",
      timestamp: new Date("2024-01-08T14:35:00"),
      comment: "생활습관 교정에 대한 조언이 좋습니다. 다만 더 구체적인 방법을 제시했다면 더 좋았을 것입니다.",
      score: 7,
    },
  ],
}

export default function ResultsPage({ params }: { params: { id: string } }) {
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  const averageMessageScore =
    sampleGradingResult.messages
      .filter((msg) => msg.role === "user" && msg.score)
      .reduce((sum, msg) => sum + (msg.score || 0), 0) /
    sampleGradingResult.messages.filter((msg) => msg.role === "user" && msg.score).length

  return (
    <div className="min-h-screen bg-gray-50">
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
                <Button variant="ghost">환자 시뮬레이션</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">채점 결과</h1>
            <p className="text-gray-600">{sampleGradingResult.assignmentTitle}</p>
          </div>
          <Link href="/courses/1">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              과제 목록으로
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 점수 및 총평 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  채점 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 점수 표시 */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">총점</h3>
                      <p className="text-sm text-gray-600">
                        제출: {formatDate(sampleGradingResult.submittedAt)} | 채점:{" "}
                        {formatDate(sampleGradingResult.gradedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={`text-3xl font-bold ${getScoreColor(sampleGradingResult.totalScore)}`}>
                          {sampleGradingResult.totalScore}
                        </span>
                        <span className="text-lg text-gray-500">/ {sampleGradingResult.maxScore}</span>
                        <Badge
                          variant={
                            sampleGradingResult.totalScore >= 80
                              ? "success"
                              : sampleGradingResult.totalScore >= 70
                                ? "warning"
                                : "destructive"
                          }
                          className="ml-2"
                        >
                          {getScoreGrade(sampleGradingResult.totalScore)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(sampleGradingResult.totalScore / 20)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 총평 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      교수님 총평
                    </h3>
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700 leading-relaxed">{sampleGradingResult.overallFeedback}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 대화 내역 및 개별 코멘트 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  대화 내역 및 개별 피드백
                </CardTitle>
                <p className="text-sm text-gray-600">각 대화에 대한 교수님의 상세 피드백입니다.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleGradingResult.messages.map((message) => {
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
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {isUser ? "학생" : sampleGradingResult.patientInfo.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {message.timestamp.toLocaleTimeString("ko-KR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isUser && message.score && (
                                <Badge variant="default" className="ml-auto">
                                  {message.score}/10
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-800">{message.content}</div>
                          </div>
                        </div>

                        {/* 교수님 코멘트 (학생 메시지에만) */}
                        {isUser && message.comment && (
                          <div className="mt-2 ml-11 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">
                                교
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-700">{message.comment}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 과제 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  과제 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">과제명</h3>
                  <p className="text-sm">{sampleGradingResult.assignmentTitle}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">강의</h3>
                  <p className="text-sm">{sampleGradingResult.courseName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">담당교수</h3>
                  <p className="text-sm">{sampleGradingResult.professorName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">학생</h3>
                  <p className="text-sm">{sampleGradingResult.studentName}</p>
                </div>
              </CardContent>
            </Card>

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
                    <h3 className="font-semibold text-lg">{sampleGradingResult.patientInfo.name}</h3>
                    <p className="text-sm text-gray-600">{sampleGradingResult.patientInfo.age}세</p>
                  </div>
                  <Badge variant="default">{getGenderText(sampleGradingResult.patientInfo.gender)}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-600">주요 증상</h3>
                  <p className="text-sm mt-1 p-2 bg-red-50 rounded border-l-4 border-red-200">
                    {sampleGradingResult.patientInfo.symptom}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-600">병력</h3>
                  <p className="text-sm mt-1 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                    {sampleGradingResult.patientInfo.history}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  상세 통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">총 대화 수</span>
                  <span className="font-semibold">{sampleGradingResult.messages.length}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">학생 발언</span>
                  <span className="font-semibold">
                    {sampleGradingResult.messages.filter((msg) => msg.role === "user").length}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">평균 점수</span>
                  <span className={`font-semibold ${getScoreColor(averageMessageScore)}`}>
                    {averageMessageScore.toFixed(1)}/10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">제출일</span>
                  <span className="text-sm">{formatDate(sampleGradingResult.submittedAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">채점일</span>
                  <span className="text-sm">{formatDate(sampleGradingResult.gradedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
