"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  BookOpen,
  User,
  Clock,
  FileText,
  Search,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  GraduationCap,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import type {
  Prescription,
  ProfessorAssignmentDetailResponseDto as AssignmentDetail
} from "@/types/assignmentProfessor"

interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
  error: any;
}

// 학생 제출 상태 타입
type SubmissionStatus = "graded" | "needs_grading" | "not_submitted"

// 수강생들의 제출 및 채점 현황 타입
interface CourseAndSubmissionStatus {
  enrolledCount: number
  evaluatedCount: number
  evaluationRequiredCount: number
  notSubmittedCount: number
}

// 학생 제출 정보 타입
interface StudentSubmission {
  accountId: number
  studentName: string
  studentId: string
  email: string
  status: SubmissionStatus
  submittedAt?: string
  turns?: number
  score?: number
  primaryDiagnosis?: string
  prescriptions?: Prescription[]
}

interface StudentSubmissionResponseDto {
  content: StudentSubmission[]
  page: number
  size: number
  hasNext: boolean
  hasPrevious: boolean
  first: boolean
  last: boolean
}

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const courseId = Number.parseInt(params.id as string)
  const assignmentId = Number.parseInt(params.assignmentId as string)

  const [assignment, setAssignment] = useState<AssignmentDetail>(null)
  const [stats, setCourseAndSubmissionStatus] = useState<CourseAndSubmissionStatus>(null)
  const [filteredSubmissions, setFilteredSubmissions] = useState<StudentSubmission[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const [isError, setIsError] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [errorSubmissions, setErrorSubmissions] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);

  const observerTarget = useRef<HTMLDivElement>(null);

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

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case "graded":
        return <Badge className="bg-green-100 text-green-800">채점완료</Badge>
      case "needs_grading":
        return <Badge className="bg-orange-100 text-orange-800">채점필요</Badge>
      case "not_submitted":
        return <Badge className="bg-red-100 text-red-800">미제출</Badge>
    }
  }

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case "graded":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "needs_grading":
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      case "not_submitted":
        return <XCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return ""
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const fetchFilteredSubmissions = useCallback(async (status: string, page: number, append: boolean = false) => {
    if (isError) return
    if (append) {
      setIsFetchingMore(true)
    } else {
      setLoadingSubmissions(true)
      setFilteredSubmissions([]) // 새 필터 또는 첫 로드 시 초기화
      setCurrentPage(0)
      setHasNextPage(true)
    }
    
    try {
      const response = await fetch(`/api/professor/courses/${courseId}/assignments/${assignmentId}/submissions?page=${page}&status=${status}`, {
        credentials: "include",
      })

      const data: ApiResponse<StudentSubmissionResponseDto> = await response.json()
      if (response.ok && data.data && data.data.content) {
        if (append) {
          setFilteredSubmissions((prevSubmissions) => [...prevSubmissions, ...data.data!.content])
        } else {
          setFilteredSubmissions(data.data.content)
        }
        setHasNextPage(data.data.hasNext)
        setCurrentPage(data.data.page)
      } else {
        setIsError(true)
        setErrorSubmissions(data.message || "제출 목록을 불러오는데 실패했습니다");
        if (!append) setFilteredSubmissions([])
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      setErrorSubmissions("제출 목록을 불러오는데 실패했습니다");
      if (!append) setFilteredSubmissions([])
    } finally {
      if (append) {
        setIsFetchingMore(false)
      }
      else {
        setLoadingSubmissions(false)
      }
    }
  }, [courseId, assignmentId])

  useEffect(() => {
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

    const fetchCourseAndSubmissionStastus = async () => {
      try {
        const response = await fetch(`/api/professor/courses/${courseId}/assignments/${assignmentId}/submissions/status`)
        if (!response.ok) {
          throw new Error("Failed to fetch submission's status data")
        }

        const result = await response.json()
        if (result.status === "OK") {
          setCourseAndSubmissionStatus(result.data)
        } else {
          throw new Error(result.message || "Failed to fetch submission's status data")
        }
      } catch (error) {
        console.error("과제 제출 현황 조회 실패:", error)
      }
    }

    fetchCourseAndSubmissionStastus()
  }, [courseId, assignmentId])

  // 무한 스크롤 IntersectionObserver 설정
  useEffect(() => {
    if(isError) return
    if (!observerTarget.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingMore && !loadingSubmissions) {
          setCurrentPage((prevPage) => prevPage + 1)
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerTarget.current)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingMore, loadingSubmissions, isError])

  useEffect(() => {
    fetchFilteredSubmissions(statusFilter, 0, false)
  }, [statusFilter, fetchFilteredSubmissions])

  // currentPage가 변경될 때 추가 데이터 로드
  useEffect(() => {
    if (currentPage > 0 && hasNextPage && !isFetchingMore && !loadingSubmissions) {
      fetchFilteredSubmissions(statusFilter, currentPage, true)
    }
  }, [currentPage, statusFilter, fetchFilteredSubmissions, hasNextPage, isFetchingMore, loadingSubmissions])


  // 필터링 및 검색
  // useEffect(() => {
  //   let filtered = filteredSubmissions

  //   // 상태 필터
  //   if (statusFilter !== "all") {
  //     filtered = filtered.filter((submission) => submission.status === statusFilter)
  //   }

  //   // 검색 필터
  //   if (searchTerm) {
  //     filtered = filtered.filter(
  //       (submission) =>
  //         submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         submission.studentId.includes(searchTerm) ||
  //         submission.email.toLowerCase().includes(searchTerm.toLowerCase()),
  //     )
  //   }

  //   setFilteredSubmissions(filtered)
  // }, [statusFilter, searchTerm, filteredSubmissions])

  const handleExportExcel = () => {
    console.log("Excel 내보내기")
    // 실제로는 Excel 파일 생성 로직
  }

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

  if (!assignment || !filteredSubmissions || !stats) {
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
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/courses/professor/${courseId}`}>
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  과제 목록
                </Button>
              </Link>
              <GraduationCap className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">과제 수행현황</h1>
                <p className="text-sm text-gray-600">{assignment.title}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 과제 정보 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{assignment.title}</h2>
              <p className="text-gray-700 mb-4">{assignment.objective}</p>
              <div className="space-y-2 text-sm text-gray-600">
                {/* <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  생성일: {formatDate(assignment.createdAt)}
                </div> */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  마감일: {formatDate(assignment.dueDate)}
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  최대 턴 수: {assignment.maxTurns}턴
                </div>
              </div>
            </div>

            {/* 환자 정보 */}
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                환자 정보
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">이름:</span>
                  <span className="font-medium">{assignment.personaName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">나이:</span>
                  <span className="font-medium">{assignment.personaAge}세</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">성별:</span>
                  <span className="font-medium">{getGenderText(assignment.personaGender)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.enrolledCount}</p>
                <p className="text-sm text-gray-600">전체 수강생</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.evaluatedCount}</p>
                <p className="text-sm text-gray-600">채점완료</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mr-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.evaluationRequiredCount}</p>
                <p className="text-sm text-gray-600">채점필요</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mr-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.notSubmittedCount}</p>
                <p className="text-sm text-gray-600">미제출</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>수강생 목록</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="graded">채점완료</SelectItem>
                      <SelectItem value="needs_grading">채점필요</SelectItem>
                      <SelectItem value="not_submitted">미제출</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="이름, 학번, 이메일 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-[250px]"
                  />
                </div>
                <Button variant="outline" onClick={handleExportExcel}>
                  <Download className="w-4 h-4 mr-2" />
                  Excel 다운로드
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학생 정보</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>제출일시</TableHead>
                    <TableHead>턴 수</TableHead>
                    <TableHead>점수</TableHead>
                    <TableHead>최종 진단</TableHead>
                    <TableHead>처방</TableHead>
                    <TableHead className="text-center">상세보기</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSubmissions && filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        제출 목록을 불러오는 중...
                      </TableCell>
                    </TableRow>
                    // <TableRow>
                    //   <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    //     검색 결과가 없습니다.
                    //   </TableCell>
                    // </TableRow>
                  ) : errorSubmissions ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        <p>{errorSubmissions}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <TableRow key={submission.accountId} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{submission.studentName}</div>
                            <div className="text-sm text-gray-600">{submission.studentId}</div>
                            <div className="text-xs text-gray-500">{submission.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            {getStatusBadge(submission.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {submission.submittedAt ? (
                            <div className="text-sm">{formatDate(submission.submittedAt)}</div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.turns ? (
                            <span className="text-sm">{submission.turns}턴</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.score ? (
                            <span className={`font-semibold ${getScoreColor(submission.score)}`}>
                              {submission.score}점
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.primaryDiagnosis ? (
                            <span className="text-sm">{submission.primaryDiagnosis}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.prescriptions ? (
                            submission.prescriptions.map((prescription) => {
                              const drugName = prescription.drugName
                              return (<span className="text-sm">{drugName}</span>)
                            })
                            // <span className="text-sm">{submission.prescriptions}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {submission.status !== "not_submitted" ? (
                            <Link
                              href={`/courses/professor/${courseId}/assignments/${assignmentId}/students/${submission.accountId}`}
                            >
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                상세보기
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* 무한 스크롤 트리거 및 로딩 메시지 */}
              <div ref={observerTarget} className="py-4 text-center">
                {isFetchingMore && <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />}
                {!hasNextPage && !loadingSubmissions && filteredSubmissions.length > 0 && (
                  <p className="text-gray-500">더 이상 제출목록이 없습니다.</p>
                )}
              </div>
              {/* 제출목록이 없을 때 */}
              {filteredSubmissions.length === 0 && !loadingSubmissions && !errorSubmissions && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {statusFilter === "all" ? "등록된 수강생의 제출이 없습니다" : "해당 상태의 제출목록이 없습니다"}
                  </h3>
                  <p className="text-gray-600">{statusFilter !== "all" && "다른 상태를 선택해보세요."}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
