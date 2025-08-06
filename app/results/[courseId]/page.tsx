
"use client"


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


import React, { useEffect, useState } from "react"


// URL 구조를 /results/[courseId]/[assignmentId]로 변경
export default function ResultsPage({ params }: { params: { id: string } }) {
  const assignmentId = params.id
  const courseId = params.id

  const [assignmentDetail, setAssignmentDetail] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/student/courses/${courseId}/assignments/${assignmentId}`, { credentials: "include" }).then(res => res.json()),
      fetch(`/api/student/assignments/${assignmentId}/my-summary`, { credentials: "include" }).then(res => res.json()),
    ])
      .then(([detailRes, summaryRes]) => {
        if (detailRes.code !== 200) throw new Error(detailRes.message)
        if (summaryRes.code !== 200) throw new Error(summaryRes.message)
        setAssignmentDetail(detailRes.data)
        setSummary(summaryRes.data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [assignmentId, courseId])

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function getGenderText(gender: string) {
    return gender === "MALE" ? "남성" : "여성"
  }

  function getScoreColor(score: number) {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  function getScoreGrade(score: number) {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  // 평균 점수 계산 (chatFeedbacks에 score가 있을 때)
  const avgScore = summary && summary.chatFeedbacks && summary.chatFeedbacks.length
    ? summary.chatFeedbacks.reduce((sum: number, f: any) => sum + (f.score || 0), 0) / summary.chatFeedbacks.length
    : 0

  if (loading) return <div className="p-8 text-center">로딩 중...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!assignmentDetail || !summary) return null

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
            <p className="text-gray-600">{assignmentDetail.title}</p>
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
                        마감일: {formatDate(assignmentDetail.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={`text-3xl font-bold ${getScoreColor(summary.score)}`}>
                          {summary.score}
                        </span>
                        <span className="text-lg text-gray-500">/ 100</span>
                        <span className={`ml-2 px-2 py-1 rounded ${getScoreColor(summary.score)}`}>
                          {getScoreGrade(summary.score)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      교수님 총평
                    </h3>
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700 leading-relaxed">{summary.feedback}</p>
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
                  {summary.chatFeedbacks?.map((item: any, idx: number) => (
                    <div key={idx} className="ml-8">
                      <div className="flex gap-3 p-4 rounded-lg bg-blue-50">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">학생</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.studentMessage.timestamp)}
                            </span>
                            {item.score && (
                              <span className="ml-auto px-2 py-1 rounded bg-blue-200 text-blue-800">
                                {item.score}/100
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-800">{item.studentMessage.message}</div>
                        </div>
                      </div>
                      {/* AI 메시지 */}
                      <div className="flex gap-3 p-4 rounded-lg bg-gray-50 ml-8">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{assignmentDetail.personaName}</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.aiMessage.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-800">{item.aiMessage.message}</div>
                        </div>
                      </div>
                      {/* 교수 피드백 */}
                      {item.feedback && (
                        <div className="mt-2 ml-11 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">
                              교
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{item.feedback}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
                  <p className="text-sm">{assignmentDetail.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">강의</h3>
                  <p className="text-sm">{assignmentDetail.courseName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">담당교수</h3>
                  <p className="text-sm">{assignmentDetail.professorName}</p>
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
                    <h3 className="font-semibold text-lg">{assignmentDetail.personaName}</h3>
                    <p className="text-sm text-gray-600">{assignmentDetail.personaAge}세</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {getGenderText(assignmentDetail.personaGender)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">주요 증상</h3>
                  <p className="text-sm mt-1 p-2 bg-red-50 rounded border-l-4 border-red-200">
                    {assignmentDetail.personaSymptom}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">병력</h3>
                  <p className="text-sm mt-1 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                    {assignmentDetail.personaHistory}
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
                  <span className="font-semibold">{summary.chatFeedbacks?.length || 0}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">평균 점수</span>
                  <span className={`font-semibold ${getScoreColor(avgScore)}`}>
                    {avgScore.toFixed(1)}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">마감일</span>
                  <span className="text-sm">{formatDate(assignmentDetail.dueDate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
