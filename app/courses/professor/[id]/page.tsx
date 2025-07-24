"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BookOpen, Users, Calendar, Clock, MapPin, FileText, Plus, Eye, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import type { ProfessorCourse } from "@/types/professor"

// 과제 상태 타입 정의
type AssignmentStatus = "grading_required" | "graded_private" | "graded_public"


interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
  error: any;
}

interface AssignmentResponseData {
  content: Assignment[];
  page: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

// 과제 타입 정의
interface Assignment {
  id: number
  title: string
  description: string
  dueDate: string
  createdDate: string
  status: AssignmentStatus
  studentStats: {
    notStarted: number
    inProgress: number
    submitted: number
    graded: number
  }
  totalStudents: number
}

interface CourseDetail {
  id: number
  name: string
  professorName: string
  semester: string
  description: string
  courseCode: string
  credits: number
}

// 교수용 강의 데이터 (실제로는 API에서 가져올 데이터)
const professorCourseData: Record<number, ProfessorCourse> = {
  1: {
    id: 1,
    name: "내과학 실습",
    semester: "2024-1학기",
    courseCode: "MED301",
    credits: 3,
    description: "내과 질환의 진단과 치료에 대한 실습 과정",
    totalStudents: 45,
    totalAssignments: 8,
    department: "의학과",
    schedule: "월, 수 14:00-16:00",
    classroom: "의학관 301호",
  },
  2: {
    id: 2,
    name: "임상진단학",
    semester: "2024-1학기",
    courseCode: "MED401",
    credits: 2,
    description: "임상에서의 진단 방법과 검사 해석",
    totalStudents: 38,
    totalAssignments: 6,
    department: "의학과",
    schedule: "화, 목 10:00-12:00",
    classroom: "의학관 205호",
  },
}

// 샘플 과제 데이터
const sampleAssignments: Assignment[] = [
  {
    id: 1,
    title: "급성 심근경색 환자 진단",
    description: "55세 남성 환자의 흉통을 주소로 내원한 케이스",
    dueDate: "2024-01-20T23:59:00",
    createdDate: "2024-01-10T09:00:00",
    status: "grading_required",
    studentStats: {
      notStarted: 8,
      inProgress: 22,
      submitted: 12,
      graded: 3,
    },
    totalStudents: 45,
  },
  {
    id: 2,
    title: "당뇨병 합병증 관리",
    description: "제2형 당뇨병 환자의 합병증 진단 및 치료 계획",
    dueDate: "2024-01-15T23:59:00",
    createdDate: "2024-01-05T09:00:00",
    status: "graded_public",
    studentStats: {
      notStarted: 0,
      inProgress: 0,
      submitted: 0,
      graded: 45,
    },
    totalStudents: 45,
  },
  {
    id: 3,
    title: "고혈압 환자 상담",
    description: "고혈압 진단을 받은 환자의 생활습관 개선 상담",
    dueDate: "2024-01-25T23:59:00",
    createdDate: "2024-01-15T09:00:00",
    status: "grading_required",
    studentStats: {
      notStarted: 35,
      inProgress: 8,
      submitted: 2,
      graded: 0,
    },
    totalStudents: 45,
  },
  {
    id: 4,
    title: "폐렴 환자 치료",
    description: "지역사회 획득 폐렴 환자의 진단과 항생제 선택",
    dueDate: "2024-01-18T23:59:00",
    createdDate: "2024-01-08T09:00:00",
    status: "graded_private",
    studentStats: {
      notStarted: 0,
      inProgress: 0,
      submitted: 0,
      graded: 45,
    },
    totalStudents: 45,
  },
  {
    id: 5,
    title: "복부팽만 환자 감별진단",
    description: "간경화 환자의 복수 및 합병증 관리에 대한 케이스 스터디",
    dueDate: "2024-01-12T23:59:00",
    createdDate: "2023-12-18T13:30:00",
    status: "grading_required",
    studentStats: {
      notStarted: 5,
      inProgress: 15,
      submitted: 20,
      graded: 5,
    },
    totalStudents: 45,
  },
  {
    id: 6,
    title: "호흡곤란 환자 진단",
    description: "COPD 급성 악화 환자의 진료 및 치료 계획 수립을 연습",
    dueDate: "2024-01-18T23:59:00",
    createdDate: "2024-01-06T16:45:00",
    status: "graded_public",
    studentStats: {
      notStarted: 0,
      inProgress: 0,
      submitted: 0,
      graded: 45,
    },
    totalStudents: 45,
  },
]

export default function ProfessorCoursePage() {
  const params = useParams()
  const corseId = params.id as string
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const courseId =params.id as string;
  const course = professorCourseData[courseId]

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [errorAssignments, setErrorAssignments] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [loadingCourseDetail, setLoadingCourseDetail] = useState(true);
  const [errorCourseDetail, setErrorCourseDetail] = useState<string | null>(null);


  const [isError, setIsError] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // 강의 상세 정보 가져오기
    const fetchCourseDetail = useCallback(async () => {
      setLoadingCourseDetail(true);
      setErrorCourseDetail(null);
      // API 호출 대신 하드코딩된 데이터 사용
      setTimeout(() => {
        setCourseDetail({
          id: parseInt(courseId),
          name: "기본 강의 제목",
          professorName: "김교수",
          semester: "2024년 1학기",
          description: "이 강의는 아직 백엔드 API가 개발되지 않아 하드코딩된 데이터로 표시됩니다.",
          courseCode: "CS000",
          credits: 3,
        });
        setLoadingCourseDetail(false);
      }, 500); // 0.5초 지연 시뮬레이션
    }, [courseId]);

  // 필터링된 과제 목록
  // const filteredAssignments = sampleAssignments.filter((assignment) => {
  //   if (selectedStatus === "all") return true
  //   return assignment.status === selectedStatus
  // })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case "grading_required":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">채점 진행중</Badge>
        )
      case "graded_private":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">채점 완료</Badge>
      case "graded_public":
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">결과 공개</Badge>
    }
  }

  // const getNotSubmittedCount = (assignment: Assignment) => {
  //   return assignment.studentStats.notStarted + assignment.studentStats.inProgress
  // }

  // const getSubmittedCount = (assignment: Assignment) => {
  //   return assignment.studentStats.submitted + assignment.studentStats.graded
  // }

   // 과제 목록 가져오기
    const fetchAssignments = useCallback(async (status: string, page: number, append: boolean = false) => {
      if(isError) return;
      if (append) {
        setIsFetchingMore(true);
      } else {
        setLoadingAssignments(true);
        setAssignments([]); // 새 필터 또는 첫 로드 시 기존 과제 초기화
        setCurrentPage(0);
        setHasNextPage(true);
      }
      setErrorAssignments(null);
  
      try {
        // const statusQuery = status === "all" ? "" : `&status=${status}`;
        const response = await fetch(`/api/professor/courses/${courseId}/assignments?page=${page}`, {
          credentials: "include",
        });
        const data: ApiResponse<AssignmentResponseData> = await response.json();
        if (response.ok && data.data && data.data.content) {
          if (append) {
            setAssignments((prevAssignments) => [...prevAssignments, ...data.data!.content]);
          } else {
            setAssignments(data.data.content);
          }
          setHasNextPage(data.data.hasNext);
          setCurrentPage(data.data.page);
        } else {
          setIsError(true);
          setErrorAssignments(data.message || "과제 목록을 불러오는데 실패했습니다.");
          if (!append) setAssignments([]);
        }
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
        setErrorAssignments("과제 목록을 불러오는 중 오류가 발생했습니다.");
        if (!append) setAssignments([]);
      } finally {
        if (append) {
          setIsFetchingMore(false);
        }
        else {
          setLoadingAssignments(false);
        }
      }
    }, [courseId]);

  // 과제 필터 또는 courseId 변경 시 과제 목록 재로드
    useEffect(() => {
      if (user && courseDetail) { // courseDetail이 로드된 후에 과제 로드 시작
        fetchAssignments(selectedStatus, 0, false);
      }
    }, [user, courseDetail, selectedStatus, fetchAssignments, isError]);

  // 무한 스크롤 IntersectionObserver 설정
    useEffect(() => {
      if(isError) return;
      if (!observerTarget.current) return;
  
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingMore && !loadingAssignments) {
            setCurrentPage((prevPage) => prevPage + 1);
          }
        },
        { threshold: 1.0 }
      );
  
      observer.observe(observerTarget.current);
  
      return () => {
        observer.disconnect();
      };
    }, [hasNextPage, isFetchingMore, loadingAssignments, isError]);

  // currentPage가 변경될 때 추가 데이터 로드
    useEffect(() => {
      if (currentPage > 0 && hasNextPage && !isFetchingMore && !loadingAssignments) {
        fetchAssignments(selectedStatus, currentPage, true);
      }
    }, [currentPage, selectedStatus, fetchAssignments, hasNextPage, isFetchingMore, loadingAssignments]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "PROFESSOR")) {
      router.push("/login")
    }else if (user && user.role === "PROFESSOR") {
      fetchCourseDetail();
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

  if (!user || user.role !== "PROFESSOR" || !course) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  강의 목록
                </Button>
              </Link>
              <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{course.name}</h1>
                <p className="text-sm text-gray-600">{course.courseCode}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.name} 교수</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 강의 정보 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {course.semester}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  수강생 {course.totalStudents}명
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.schedule}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {course.classroom}
                </span>
              </div>
            </div>
            <Badge variant="default">{course.department}</Badge>
          </div>
          <p className="text-gray-700">{course.description}</p>
        </div>

        {/* 필터 및 새 과제 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">과제 관리</h2>
            {/* <div className="flex items-center gap-2">
              <label htmlFor="status-select" className="text-sm font-medium text-gray-700">
                상태:
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="grading_required">채점 진행중</SelectItem>
                  <SelectItem value="graded_private">채점 완료</SelectItem>
                  <SelectItem value="graded_public">결과 공개</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>
          <Link href={`/courses/professor/${courseId}/assignments/create`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />새 과제 생성
            </Button>
          </Link>
        </div>

        {/* 과제 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => {
            // const notSubmittedCount = getNotSubmittedCount(assignment)
            // const submittedCount = getSubmittedCount(assignment)

            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{assignment.title}</CardTitle>
                      <p className="text-sm text-gray-600">마감: {formatDate(assignment.dueDate)}</p>
                    </div>
                    {/* {getStatusBadge(assignment.status)} */}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 과제 설명 */}
                  <p className="text-sm text-gray-700 line-clamp-2">{assignment.description}</p>

                  {/* 제출 현황 */}
                  {/* <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">제출 현황</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">미제출</span>
                      <span className="text-sm font-semibold text-red-600">{notSubmittedCount}명</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">제출완료</span>
                      <span className="text-sm font-semibold text-green-600">{submittedCount}명</span>
                    </div>
                  </div> */}

                  {/* 생성일 */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <Clock className="w-4 h-4" />
                    <span>생성일: {formatDate(assignment.createdDate)}</span>
                  </div>

                  {/* 수행현황 보기 버튼 */}
                  <Link href={`/courses/professor/${courseId}/assignments/${assignment.id}`}>
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      수행현황 보기
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 무한 스크롤 트리거 및 로딩 메시지 */}
        <div ref={observerTarget} className="py-4 text-center">
          {isFetchingMore && <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />}
          {!hasNextPage && !loadingAssignments && assignments.length > 0 && (
            <p className="text-gray-500">더 이상 과제가 없습니다.</p>
          )}
        </div>

        {/* 과제가 없을 때 */}
        {assignments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedStatus === "all" ? "등록된 과제가 없습니다" : "해당하는 과제가 없습니다"}
            </h3>
            <p className="text-gray-600 mb-4">새로운 환자 케이스 과제를 생성해보세요.</p>
            {/* <Link href={`/courses/professor/${courseId}/assignments/create`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />새 과제 생성
              </Button>
            </Link> */}
          </div>
        )}
      </div>
    </div>
  )
}
