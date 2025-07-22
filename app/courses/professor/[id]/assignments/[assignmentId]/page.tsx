"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

// 학생 제출 상태 타입
type SubmissionStatus = "graded" | "needs_grading" | "not_submitted"

// 학생 제출 정보 타입
interface StudentSubmission {
  studentId: number
  studentName: string
  studentNumber: string
  email: string
  status: SubmissionStatus
  submittedAt?: string
  turnCount?: number
  score?: number
  finalDiagnosis?: string
  prescription?: string
}

// 과제 정보 타입
interface AssignmentDetail {
  id: number
  title: string
  description: string
  createdAt: string
  dueDate: string
  maxTurns: number
  patientInfo: {
    name: string
    age: number
    gender: "MALE" | "FEMALE"
    address: string
  }
  totalStudents: number
  submissions: StudentSubmission[]
}

// 샘플 데이터
const sampleAssignment: AssignmentDetail = {
  id: 1,
  title: "급성 심근경색 환자 진단",
  description:
    "55세 남성 환자가 급성 흉통을 주소로 응급실에 내원하였습니다. 환자와의 대화를 통해 병력을 청취하고 적절한 진단과 치료 계획을 수립하세요.",
  createdAt: "2024-01-15T09:00:00",
  dueDate: "2024-01-25T23:59:59",
  maxTurns: 10,
  patientInfo: {
    name: "김철수",
    age: 55,
    gender: "MALE",
    address: "서울시 강남구",
  },
  totalStudents: 45,
  submissions: [
    {
      studentId: 1,
      studentName: "김민수",
      studentNumber: "2020123001",
      email: "minsu.kim@university.ac.kr",
      status: "needs_grading",
      submittedAt: "2024-01-18T14:30:00",
      turnCount: 8,
      finalDiagnosis: "급성 심근경색",
      prescription: "아스피린, 클로피도그렐",
    },
    {
      studentId: 2,
      studentName: "이지영",
      studentNumber: "2020123002",
      email: "jiyoung.lee@university.ac.kr",
      status: "needs_grading",
      submittedAt: "2024-01-19T10:15:00",
      turnCount: 6,
      finalDiagnosis: "불안정 협심증",
      prescription: "니트로글리세린, 베타차단제",
    },
    {
      studentId: 3,
      studentName: "박서준",
      studentNumber: "2020123003",
      email: "seojun.park@university.ac.kr",
      status: "not_submitted",
    },
    {
      studentId: 4,
      studentName: "최서연",
      studentNumber: "2020123004",
      email: "seoyeon.choi@university.ac.kr",
      status: "graded",
      submittedAt: "2024-01-17T16:45:00",
      turnCount: 9,
      score: 92,
      finalDiagnosis: "급성 심근경색",
      prescription: "아스피린, 클로피도그렐, ACE 억제제",
    },
    {
      studentId: 5,
      studentName: "정현우",
      studentNumber: "2020123005",
      email: "hyunwoo.jung@university.ac.kr",
      status: "needs_grading",
      submittedAt: "2024-01-20T08:20:00",
      turnCount: 7,
      finalDiagnosis: "급성 심근경색",
      prescription: "아스피린, 스타틴",
    },
    {
      studentId: 6,
      studentName: "한소희",
      studentNumber: "2020123006",
      email: "sohee.han@university.ac.kr",
      status: "not_submitted",
    },
    {
      studentId: 7,
      studentName: "윤태영",
      studentNumber: "2020123007",
      email: "taeyoung.yoon@university.ac.kr",
      status: "graded",
      submittedAt: "2024-01-16T20:30:00",
      turnCount: 10,
      score: 88,
      finalDiagnosis: "급성 심근경색",
      prescription: "아스피린, 클로피도그렐",
    },
    {
      studentId: 8,
      studentName: "강민지",
      studentNumber: "2020123008",
      email: "minji.kang@university.ac.kr",
      status: "needs_grading",
      submittedAt: "2024-01-21T12:00:00",
      turnCount: 5,
      finalDiagnosis: "심근염",
      prescription: "소염제, 안정",
    },
  ],
}

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const courseId = Number.parseInt(params.id as string)
  const assignmentId = Number.parseInt(params.assignmentId as string)

  const [assignment] = useState<AssignmentDetail>(sampleAssignment)
  const [filteredSubmissions, setFilteredSubmissions] = useState<StudentSubmission[]>(assignment.submissions)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

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

  // 통계 계산
  const stats = {
    total: assignment.totalStudents,
    graded: assignment.submissions.filter((s) => s.status === "graded").length,
    needsGrading: assignment.submissions.filter((s) => s.status === "needs_grading").length,
    notSubmitted: assignment.submissions.filter((s) => s.status === "not_submitted").length,
  }

  // 필터링 및 검색
  useEffect(() => {
    let filtered = assignment.submissions

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((submission) => submission.status === statusFilter)
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (submission) =>
          submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.studentNumber.includes(searchTerm) ||
          submission.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredSubmissions(filtered)
  }, [statusFilter, searchTerm, assignment.submissions])

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
              <p className="text-gray-700 mb-4">{assignment.description}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  생성일: {formatDate(assignment.createdAt)}
                </div>
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
                  <span className="font-medium">{assignment.patientInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">나이:</span>
                  <span className="font-medium">{assignment.patientInfo.age}세</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">성별:</span>
                  <span className="font-medium">{getGenderText(assignment.patientInfo.gender)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주소:</span>
                  <span className="font-medium">{assignment.patientInfo.address}</span>
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
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
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
                <p className="text-2xl font-bold text-orange-600">{stats.needsGrading}</p>
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
                <p className="text-2xl font-bold text-red-600">{stats.notSubmitted}</p>
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
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((submission) => (
                      <TableRow key={submission.studentId} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{submission.studentName}</div>
                            <div className="text-sm text-gray-600">{submission.studentNumber}</div>
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
                          {submission.turnCount ? (
                            <span className="text-sm">{submission.turnCount}턴</span>
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
                          {submission.finalDiagnosis ? (
                            <span className="text-sm">{submission.finalDiagnosis}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission.prescription ? (
                            <span className="text-sm">{submission.prescription}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {submission.status !== "not_submitted" ? (
                            <Link
                              href={`/courses/professor/${courseId}/assignments/${assignmentId}/students/${submission.studentId}`}
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
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
