"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
  User,
  Calendar,
  Clock,
  ChevronRight,
  GraduationCap,
  ArrowLeft,
  Stethoscope,
  FileText,
  Play,
  CheckCircle,
  Circle,
  ClockIcon,
  Eye,
} from "lucide-react"
import Link from "next/link"

// 타입 정의
enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

enum AssignmentStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
}

interface Assignment {
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
  status: AssignmentStatus
  currentTurns?: number
  submittedAt?: string
  gradedAt?: string
  score?: number
  description: string
}

interface Course {
  id: number
  name: string
  professorName: string
  semester: string
  description: string
  courseCode: string
  credits: number
}

// Badge 컴포넌트
function Badge({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "destructive" | "success" | "warning" | "secondary"
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
    case "secondary":
      variantClasses = "bg-gray-100 text-gray-800 border-gray-200"
      break
    default:
      variantClasses = "bg-blue-100 text-blue-800 border-blue-200"
  }

  return <div className={`${baseClasses} ${variantClasses} ${className}`}>{children}</div>
}

// 샘플 강의 데이터
const sampleCourse: Course = {
  id: 1,
  name: "내과학 실습",
  professorName: "이진료",
  semester: "2024-1학기",
  description: "내과 질환의 진단과 치료에 대한 실습 과정",
  courseCode: "MED301",
  credits: 3,
}

// 샘플 과제 데이터
const sampleAssignments: Assignment[] = [
  {
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
    status: AssignmentStatus.IN_PROGRESS,
    currentTurns: 8,
    description: "급성 충수염이 의심되는 중년 여성 환자의 진료 과정을 시뮬레이션합니다.",
  },
  {
    id: 2,
    title: "당뇨병 환자 상담 케이스",
    personaName: "박당뇨",
    personaAge: 58,
    personaGender: GenderType.MALE,
    personaSymptom: "다음, 다뇨, 다식, 체중감소",
    personaHistory: "가족력: 부모 모두 당뇨병, 흡연력 30년",
    maxTurns: 15,
    dueDate: "2024-01-20T23:59:00",
    courseName: "내과학 실습",
    semester: "2024-1학기",
    professorName: "이진료",
    status: AssignmentStatus.NOT_STARTED,
    description: "제2형 당뇨병 신규 진단 환자의 초기 상담 및 교육 과정을 연습합니다.",
  },
  {
    id: 3,
    title: "고혈압 환자 추적관찰",
    personaName: "최고혈",
    personaAge: 62,
    personaGender: GenderType.FEMALE,
    personaSymptom: "두통, 어지러움, 목 뒤 뻣뻣함",
    personaHistory: "고혈압 진단 5년, 약물 복용 불규칙",
    maxTurns: 12,
    dueDate: "2024-01-10T23:59:00",
    courseName: "내과학 실습",
    semester: "2024-1학기",
    professorName: "이진료",
    status: AssignmentStatus.GRADED,
    currentTurns: 12,
    submittedAt: "2024-01-08T14:30:00",
    gradedAt: "2024-01-09T10:15:00",
    score: 85,
    description: "고혈압 환자의 약물 순응도 개선 및 생활습관 교정 상담을 진행합니다.",
  },
  {
    id: 4,
    title: "흉통 환자 응급처치",
    personaName: "김흉통",
    personaAge: 55,
    personaGender: GenderType.MALE,
    personaSymptom: "갑작스런 가슴 통증, 호흡곤란, 식은땀",
    personaHistory: "흡연력 25년, 고지혈증, 가족력: 심근경색",
    maxTurns: 25,
    dueDate: "2024-01-25T23:59:00",
    courseName: "내과학 실습",
    semester: "2024-1학기",
    professorName: "이진료",
    status: AssignmentStatus.SUBMITTED,
    currentTurns: 25,
    submittedAt: "2024-01-12T16:45:00",
    description: "급성 심근경색이 의심되는 환자의 응급 진료 과정을 시뮬레이션합니다.",
  },
  {
    id: 5,
    title: "호흡곤란 환자 진단",
    personaName: "이호흡",
    personaAge: 67,
    personaGender: GenderType.FEMALE,
    personaSymptom: "점진적 호흡곤란, 기침, 가래",
    personaHistory: "만성폐쇄성폐질환, 흡연력 40년",
    maxTurns: 18,
    dueDate: "2024-01-18T23:59:00",
    courseName: "내과학 실습",
    semester: "2024-1학기",
    professorName: "이진료",
    status: AssignmentStatus.IN_PROGRESS,
    currentTurns: 3,
    description: "COPD 급성 악화 환자의 진료 및 치료 계획 수립을 연습합니다.",
  },
  {
    id: 6,
    title: "복부팽만 환자 감별진단",
    personaName: "정복부",
    personaAge: 72,
    personaGender: GenderType.MALE,
    personaSymptom: "복부팽만, 식욕부진, 체중감소",
    personaHistory: "간경화 병력, 음주력 30년",
    maxTurns: 20,
    dueDate: "2024-01-12T23:59:00",
    courseName: "내과학 실습",
    semester: "2024-1학기",
    professorName: "이진료",
    status: AssignmentStatus.GRADED,
    currentTurns: 20,
    submittedAt: "2024-01-11T16:45:00",
    gradedAt: "2024-01-12T09:30:00",
    score: 92,
    description: "간경화 환자의 복수 및 합병증 관리에 대한 케이스 스터디입니다.",
  },
]

export default function CourseAssignmentsPage({ params }: { params: { id: string } }) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  // 상태별 과제 필터링
  const filteredAssignments =
    selectedStatus === "all"
      ? sampleAssignments
      : sampleAssignments.filter((assignment) => assignment.status === selectedStatus)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusInfo = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.NOT_STARTED:
        return {
          variant: "secondary" as const,
          text: "진행전",
          icon: <Circle className="w-4 h-4" />,
        }
      case AssignmentStatus.IN_PROGRESS:
        return {
          variant: "warning" as const,
          text: "진행중",
          icon: <Play className="w-4 h-4" />,
        }
      case AssignmentStatus.SUBMITTED:
        return {
          variant: "default" as const,
          text: "채점 대기중",
          icon: <ClockIcon className="w-4 h-4" />,
        }
      case AssignmentStatus.GRADED:
        return {
          variant: "success" as const,
          text: "채점 완료",
          icon: <CheckCircle className="w-4 h-4" />,
        }
    }
  }

  const getGenderText = (gender: GenderType) => {
    return gender === GenderType.MALE ? "남성" : "여성"
  }

  const isOverdue = (dueDate: string, status: AssignmentStatus) => {
    return new Date(dueDate) < new Date() && status === AssignmentStatus.NOT_STARTED
  }

  const getProgressPercentage = (current = 0, max: number) => {
    return Math.round((current / max) * 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

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
                <Button variant="ghost" className="text-blue-600">
                  강의 목록
                </Button>
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
        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">
            강의 목록
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{sampleCourse.name}</span>
        </div>

        {/* 강의 정보 헤더 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{sampleCourse.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{sampleCourse.professorName} 교수</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{sampleCourse.semester}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {sampleCourse.courseCode} • {sampleCourse.credits}학점
                  </span>
                </div>
              </div>
              <p className="text-gray-700">{sampleCourse.description}</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                강의 목록으로
              </Button>
            </Link>
          </div>
        </div>

        {/* 필터 및 통계 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">케이스 스터디 과제</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>전체 {sampleAssignments.length}개</span>
              <span>•</span>
              <span className="text-green-600">
                완료 {sampleAssignments.filter((a) => a.status === AssignmentStatus.GRADED).length}개
              </span>
              <span>•</span>
              <span className="text-yellow-600">
                진행중 {sampleAssignments.filter((a) => a.status === AssignmentStatus.IN_PROGRESS).length}개
              </span>
              <span>•</span>
              <span className="text-blue-600">
                채점대기 {sampleAssignments.filter((a) => a.status === AssignmentStatus.SUBMITTED).length}개
              </span>
            </div>
          </div>

          {/* 상태 필터 드롭다운 */}
          <div className="flex items-center gap-2">
            <label htmlFor="status-select" className="text-sm font-medium text-gray-700">
              상태:
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value={AssignmentStatus.NOT_STARTED}>진행전</SelectItem>
                <SelectItem value={AssignmentStatus.IN_PROGRESS}>진행중</SelectItem>
                <SelectItem value={AssignmentStatus.SUBMITTED}>채점 대기중</SelectItem>
                <SelectItem value={AssignmentStatus.GRADED}>채점 완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 과제 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const statusInfo = getStatusInfo(assignment.status)
            const overdue = isOverdue(assignment.dueDate, assignment.status)

            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg leading-tight">{assignment.title}</CardTitle>
                    <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                      {statusInfo.icon}
                      {statusInfo.text}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 환자 정보 */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-gray-700">환자 정보</h4>
                      <Badge variant="default" className="text-xs">
                        {getGenderText(assignment.personaGender)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{assignment.personaName}</span> ({assignment.personaAge}세)
                      </p>
                      <div className="flex items-start gap-1">
                        <Stethoscope className="w-3 h-3 mt-0.5 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-gray-600 line-clamp-2">{assignment.personaSymptom}</p>
                      </div>
                      <div className="flex items-start gap-1">
                        <FileText className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-gray-600 line-clamp-2">{assignment.personaHistory}</p>
                      </div>
                    </div>
                  </div>

                  {/* 진행률 (진행중인 과제만) */}
                  {assignment.status === AssignmentStatus.IN_PROGRESS && assignment.currentTurns && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">진행률</span>
                        <span className="text-sm font-medium">
                          {assignment.currentTurns}/{assignment.maxTurns} 턴
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getProgressPercentage(assignment.currentTurns, assignment.maxTurns)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 제출 정보 */}
                  {assignment.status === AssignmentStatus.SUBMITTED && assignment.submittedAt && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      <ClockIcon className="w-4 h-4" />
                      <span>제출: {formatDate(assignment.submittedAt)}</span>
                    </div>
                  )}

                  {/* 채점 완료 정보 */}
                  {assignment.status === AssignmentStatus.GRADED && assignment.gradedAt && assignment.score && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                        <CheckCircle className="w-4 h-4" />
                        <span>채점 완료: {formatDate(assignment.gradedAt)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">점수</span>
                        <span className={`text-lg font-bold ${getScoreColor(assignment.score)}`}>
                          {assignment.score}점
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 마감일 */}
                  <div
                    className={`flex items-center gap-2 text-sm p-2 rounded ${
                      overdue
                        ? "text-red-600 bg-red-50"
                        : assignment.status === AssignmentStatus.GRADED
                          ? "text-gray-600 bg-gray-50"
                          : "text-orange-600 bg-orange-50"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>
                      {overdue ? "마감 지남" : "마감"}: {formatDate(assignment.dueDate)}
                    </span>
                  </div>

                  {/* 액션 버튼 */}
                  {assignment.status === AssignmentStatus.NOT_STARTED && (
                    <Link href={`/study/${assignment.id}`}>
                      <Button className="w-full mt-4">
                        <Play className="w-4 h-4 mr-2" />
                        과제 시작
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}

                  {assignment.status === AssignmentStatus.IN_PROGRESS && (
                    <Link href={`/study/${assignment.id}`}>
                      <Button className="w-full mt-4">
                        <Play className="w-4 h-4 mr-2" />
                        계속하기
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}

                  {assignment.status === AssignmentStatus.SUBMITTED && (
                    <Button className="w-full mt-4" disabled variant="outline">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      채점 대기중
                    </Button>
                  )}

                  {assignment.status === AssignmentStatus.GRADED && (
                    <Link href={`/results/${assignment.id}`}>
                      <Button className="w-full mt-4" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        결과 보기
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 과제가 없을 때 */}
        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedStatus === "all" ? "등록된 과제가 없습니다" : "해당 상태의 과제가 없습니다"}
            </h3>
            <p className="text-gray-600">{selectedStatus !== "all" && "다른 상태를 선택해보세요."}</p>
          </div>
        )}
      </div>
    </div>
  )
}
