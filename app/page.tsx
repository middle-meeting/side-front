"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, User, Calendar, ChevronRight, GraduationCap, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// 타입 정의
interface Course {
  id: number
  name: string
  semester: string
  professorName: string
}

interface CourseResponseData {
  content: Course[];
  page: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
  error: any;
}

export default function HomePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [errorCourses, setErrorCourses] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const observerTarget = useRef<HTMLDivElement>(null)

  const fetchCourses = useCallback(async (semester: string, page: number, append: boolean = false) => {
    if (append) {
      setIsFetchingMore(true)
    } else {
      setLoadingCourses(true)
      setCourses([]) // 새 학기 선택 시 기존 강의 초기화
      setCurrentPage(0)
      setHasNextPage(true)
    }
    setErrorCourses(null)

    try {
      const response = await fetch(`/api/student/courses?semester=${semester}&page=${page}`, {
        credentials: "include",
      })
      const data: ApiResponse<CourseResponseData> = await response.json()

      if (response.ok && data.data && data.data.content) {
        if (append) {
          setCourses((prevCourses) => [...prevCourses, ...data.data!.content])
        } else {
          setCourses(data.data.content)
        }
        setHasNextPage(data.data.hasNext)
        setCurrentPage(data.data.page)
      } else {
        setErrorCourses(data.message || "강의 목록을 불러오는데 실패했습니다.")
        if (!append) setCourses([])
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      setErrorCourses("강의 목록을 불러오는 중 오류가 발생했습니다.")
      if (!append) setCourses([])
    } finally {
      if (append) {
        setIsFetchingMore(false)
      } else {
        setLoadingCourses(false)
      }
    }
  }, [])

  const semesters = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    let startYear = currentYear;
    let startSemester = 1; // 1학기

    if (currentMonth >= 6) { // 7월 (인덱스 6)부터 2학기로 간주
      startSemester = 2;
    }

    const generatedSemesters: string[] = [];
    for (let year = startYear; year >= startYear - 5; year--) {
      if (year === startYear) {
        if (startSemester === 2) {
          generatedSemesters.push(`${year}-2`);
          generatedSemesters.push(`${year}-1`);
        } else {
          generatedSemesters.push(`${year}-1`);
        }
      } else {
        generatedSemesters.push(`${year}-2`);
        generatedSemesters.push(`${year}-1`);
      }
    }

    return generatedSemesters;
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      if (selectedSemester === "" && semesters.length > 0) {
        setSelectedSemester(semesters[0]);
      }
      // 학기 변경 시 첫 페이지부터 다시 로드
      if (selectedSemester) {
        fetchCourses(selectedSemester, 0, false);
      }
    }
  }, [isLoading, user, selectedSemester, fetchCourses, semesters])

  // 무한 스크롤 IntersectionObserver 설정
  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingMore && !loadingCourses) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerTarget.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingMore, loadingCourses]);

  // currentPage가 변경될 때 추가 데이터 로드
  useEffect(() => {
    if (currentPage > 0 && hasNextPage && !isFetchingMore && !loadingCourses) {
      fetchCourses(selectedSemester, currentPage, true);
    }
  }, [currentPage]); // selectedSemester, fetchCourses, hasNextPage, isFetchingMore, loadingCourses

  

  if (isLoading || loadingCourses && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (errorCourses) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{errorCourses}</p>
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
              {/* <Link href="/study/1">
                <Button variant="ghost">환자 시뮬레이션</Button>
              </Link> */}
              <Button
                variant="ghost"
                onClick={logout}
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
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {`${semester.split('-')[0]}년 ${semester.split('-')[1]}학기`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 강의 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{course.name}</CardTitle>
                    </div>
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
                      <span>{`${course.semester.split('-')[0]}년 ${course.semester.split('-')[1]}학기`}</span>
                    </div>
                  </div>

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

        {/* 무한 스크롤 트리거 및 로딩 메시지 */}
        <div ref={observerTarget} className="py-4 text-center">
          {isFetchingMore && <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />}
          {!hasNextPage && !loadingCourses && courses.length > 0 && (
            <p className="text-gray-500">더 이상 강의가 없습니다.</p>
          )}
        </div>

        {/* 강의가 없을 때 */}
        {courses.length === 0 && !loadingCourses && !errorCourses && (
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
