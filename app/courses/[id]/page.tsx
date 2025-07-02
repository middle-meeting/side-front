"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
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
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

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
  DRAFT = "DRAFT",
}

interface Assignment {
  id: number
  title: string
  dueDate: string
  objective: string
  status: AssignmentStatus
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

interface AssignmentResponseData {
  content: Assignment[];
  page: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

interface CourseDetailResponseData {
  id: number;
  name: string;
  professorName: string;
  semester: string;
  description: string;
  courseCode: string;
  credits: number;
}

interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
  error: any;
}

// Badge 컴포넌트 (기존 유지)
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

export default function CourseAssignmentsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const { user, isLoading: isLoadingAuth } = useAuth();

  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [loadingCourseDetail, setLoadingCourseDetail] = useState(true);
  const [errorCourseDetail, setErrorCourseDetail] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [errorAssignments, setErrorAssignments] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

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

  // 과제 목록 가져오기
  const fetchAssignments = useCallback(async (status: string, page: number, append: boolean = false) => {
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
      const statusQuery = status === "all" ? "" : `&status=${status}`;
      const response = await fetch(`/api/student/courses/${courseId}/assignments?page=${page}${statusQuery}`, {
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

  // 초기 로드 및 라우트 보호
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push("/login");
    } else if (user) {
      fetchCourseDetail();
    }
  }, [isLoadingAuth, user, router, fetchCourseDetail]);

  // 과제 필터 또는 courseId 변경 시 과제 목록 재로드
  useEffect(() => {
    if (user && courseDetail) { // courseDetail이 로드된 후에 과제 로드 시작
      fetchAssignments(selectedStatus, 0, false);
    }
  }, [user, courseDetail, selectedStatus, fetchAssignments]);

  // 무한 스크롤 IntersectionObserver 설정
  useEffect(() => {
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
  }, [hasNextPage, isFetchingMore, loadingAssignments]);

  // currentPage가 변경될 때 추가 데이터 로드
  useEffect(() => {
    if (currentPage > 0 && hasNextPage && !isFetchingMore && !loadingAssignments) {
      fetchAssignments(selectedStatus, currentPage, true);
    }
  }, [currentPage, selectedStatus, fetchAssignments, hasNextPage, isFetchingMore, loadingAssignments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.NOT_STARTED:
      case AssignmentStatus.IN_PROGRESS: // IN_PROGRESS도 진행전으로 처리
        return {
          variant: "secondary" as const,
          text: "진행전",
          icon: <Circle className="w-4 h-4" />,
        };
      case AssignmentStatus.DRAFT:
        return {
          variant: "warning" as const,
          text: "진행중",
          icon: <Play className="w-4 h-4" />,
        };
      case AssignmentStatus.SUBMITTED:
        return {
          variant: "default" as const,
          text: "제출완료",
          icon: <ClockIcon className="w-4 h-4" />,
        };
      case AssignmentStatus.GRADED:
        return {
          variant: "success" as const,
          text: "결과보기",
          icon: <Eye className="w-4 h-4" />,
        };
      default:
        return {
          variant: "secondary" as const,
          text: "알 수 없음",
          icon: <Circle className="w-4 h-4" />,
        };
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (isLoadingAuth || loadingCourseDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">강의 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (errorCourseDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{errorCourseDetail}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!courseDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p>강의 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
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
          <span className="text-gray-900">{courseDetail.name}</span>
        </div>

        {/* 강의 정보 헤더 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{courseDetail.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{courseDetail.professorName} 교수</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{courseDetail.semester}</span>
                </div>
                
              </div>
              <p className="text-gray-700">{courseDetail.description}</p>
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
        {loadingAssignments && assignments.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">과제 목록을 불러오는 중...</p>
          </div>
        ) : errorAssignments ? (
          <div className="text-center py-12 text-red-600">
            <p>{errorAssignments}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => {
              const statusInfo = getStatusInfo(assignment.status);
              const overdue = isOverdue(assignment.dueDate, assignment.status);

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
                    
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 마감일 */}
                    <div
                      className={`flex items-center gap-2 text-sm p-2 rounded text-gray-600 bg-gray-50`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>
                        마감: {formatDate(assignment.dueDate)}
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

                    {assignment.status === AssignmentStatus.DRAFT && (
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
                      <Button className="w-full mt-4" disabled variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          결과 보기
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 무한 스크롤 트리거 및 로딩 메시지 */}
        <div ref={observerTarget} className="py-4 text-center">
          {isFetchingMore && <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />}
          {!hasNextPage && !loadingAssignments && assignments.length > 0 && (
            <p className="text-gray-500">더 이상 과제가 없습니다.</p>
          )}
        </div>

        {/* 과제가 없을 때 */}
        {assignments.length === 0 && !loadingAssignments && !errorAssignments && (
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
  );
}