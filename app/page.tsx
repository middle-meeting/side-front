"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, User, Calendar, Clock, ChevronRight, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// 타입 정의
interface Course {
  id: number
  name: string
  professorName: string
  semester: string
  description: string
  totalAssignments: number
  completedAssignments: number
  nextDueDate?: string
  courseCode: string
  credits: number
}

// 샘플 강의 데이터
const sampleCourses: Course[] = [
  {
    id: 1,
    name: "내과학 실습",
    professorName: "이진료",
    semester: "2024-1학기",
    description: "내과 질환의 진단과 치료에 대한 실습 과정",
    totalAssignments: 8,
    completedAssignments: 3,
    nextDueDate: "2024-01-15T23:59:00",
    courseCode: "MED301",
    credits: 3,
  },
  {
    id: 2,
    name: "외과학 개론",
    professorName: "박수술",
    semester: "2024-1학기",
    description: "외과적 치료의 기본 원리와 수술 기법 학습",
    totalAssignments: 6,
    completedAssignments: 6,
    courseCode: "MED302",
    credits: 2,
  },
  {
    id: 3,
    name: "소아과학",
    professorName: "김아이",
    semester: "2024-1학기",
    description: "소아 질환의 특성과 치료법에 대한 종합적 학습",
    totalAssignments: 5,
    completedAssignments: 1,
    nextDueDate: "2024-01-20T23:59:00",
    courseCode: "MED303",
    credits: 3,
  },
  {
    id: 4,
    name: "한방내과학",
    professorName: "정한의",
    semester: "2023-2학기",
    description: "한의학적 관점에서의 내과 질환 진단 및 치료",
    totalAssignments: 10,
    completedAssignments: 10,
    courseCode: "KM201",
    credits: 4,
  },
  {
    id: 5,
    name: "침구학 실습",
    professorName: "최침구",
    semester: "2023-2학기",
    description: "침구 치료의 실제 적용과 임상 실습",
    totalAssignments: 12,
    completedAssignments: 12,
    courseCode: "KM202",
    credits: 3,
  },
  {
    id: 6,
    name: "병리학",
    professorName: "장병리",
    semester: "2024-2학기",
    description: "질병의 원인과 발생 기전에 대한 체계적 학습",
    totalAssignments: 7,
    completedAssignments: 0,
    nextDueDate: "2024-09-15T23:59:00",
    courseCode: "MED401",
    credits: 3,
  },
]

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

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedSemester, setSelectedSemester] = useState<string>("all")

  // 학기 목록 추출
  const semesters = ["all", ...Array.from(new Set(sampleCourses.map((course) => course.semester)))]

  // 선택된 학기에 따른 강의 필터링
  const filteredCourses =
    selectedSemester === "all" ? sampleCourses : sampleCourses.filter((course) => course.semester === selectedSemester)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getProgressStatus = (completed: number, total: number) => {
    const percentage = (completed / total) * 100
    if (percentage === 100) return { variant: "success" as const, text: "완료" }
    if (percentage >= 50) return { variant: "warning" as const, text: "진행중" }
    return { variant: "destructive" as const, text: "시작" }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
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
              <span className="text-sm text-gray-600">
                {user.name}님 ({user.role === "STUDENT" ? "학생" : "교수"})
              </span>
              <Link href="/">
                <Button variant="ghost" className="text-blue-600">
                  강의 목록
                </Button>
              </Link>
              <Link href="/study/1">
                <Button variant="ghost">환자 시뮬레이션</Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  const { logout } = useAuth()
                  logout()
                  router.push("/login")
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">수강 강의</h1>
          <p className="text-gray-600">현재 수강 중인 강의와 과제 현황을 확인하세요.</p>
        </div>

        {/* 학기 선택 드롭다운 */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="semester-select" className="text-sm font-medium text-gray-700">
              학기 선택:
            </label>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="학기를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학기</SelectItem>
                {semesters.slice(1).map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 강의 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const progressStatus = getProgressStatus(course.completedAssignments, course.totalAssignments)

            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{course.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {course.courseCode} • {course.credits}학점
                      </p>
                    </div>
                    <Badge variant={progressStatus.variant}>{progressStatus.text}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 강의 정보 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{course.professorName} 교수</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{course.semester}</span>
                    </div>
                  </div>

                  {/* 강의 설명 */}
                  <p className="text-sm text-gray-700 line-clamp-2">{course.description}</p>

                  {/* 과제 진행률 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">과제 진행률</span>
                      <span className="text-sm font-medium">
                        {course.completedAssignments}/{course.totalAssignments}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(course.completedAssignments / course.totalAssignments) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 다음 마감일 */}
                  {course.nextDueDate && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <Clock className="w-4 h-4" />
                      <span>다음 마감: {formatDate(course.nextDueDate)}</span>
                    </div>
                  )}

                  {/* 강의 입장 버튼 */}
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full mt-4" variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      강의 입장
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 강의가 없을 때 */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">선택한 학기에 수강 중인 강의가 없습니다</h3>
            <p className="text-gray-600">다른 학기를 선택해보세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}
