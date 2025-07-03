"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Calendar,
  Clock,
  GraduationCap,
  Stethoscope,
  FileText,
} from "lucide-react"
import type { StudentAssignmentDetailResponseDto, GenderType } from "@/types/assignment"

interface PatientInfoSidebarProps {
  assignment: StudentAssignmentDetailResponseDto | null
  currentTurn: number
  isSubmitted: boolean
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
  return gender === "MALE" ? "남성" : "여성"
}

export function PatientInfoSidebar({
  assignment,
  currentTurn,
  isSubmitted,
}: PatientInfoSidebarProps) {
  if (!assignment) {
    return null
  }

  return (
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
            <p className="text-sm">{assignment.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="font-semibold text-sm text-gray-600">강의</h3>
              <p className="text-sm">{assignment.courseName}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600">학기</h3>
              <p className="text-sm">{assignment.semester}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-600">담당교수</h3>
            <p className="text-sm">{assignment.professorName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              마감: {formatDate(assignment.dueDate)}
            </span>
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
              <h3 className="font-semibold text-lg">{assignment.personaName}</h3>
              <p className="text-sm text-gray-600">{assignment.personaAge}세</p>
            </div>
            <Badge
              className={
                assignment.personaGender === "MALE"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-pink-100 text-pink-800"
              }
            >
              {getGenderText(assignment.personaGender)}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-600 flex items-center gap-1">
              <Stethoscope className="w-4 h-4" />
              주요 증상
            </h3>
            <p className="text-sm mt-1 p-2 bg-red-50 rounded border-l-4 border-red-200">
              {assignment.personaSymptom}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-600 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              병력
            </h3>
            <p className="text-sm mt-1 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
              {assignment.personaHistory}
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
              <Badge
                variant={
                  currentTurn >= assignment.maxTurns ? "destructive" : "default"
                }
              >
                {currentTurn} / {assignment.maxTurns}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isSubmitted
                    ? "bg-green-500"
                    : currentTurn >= assignment.maxTurns
                      ? "bg-red-500"
                      : "bg-blue-500"
                }`}
                style={{
                  width: `${Math.min(
                    (currentTurn / assignment.maxTurns) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            {isSubmitted ? (
              <p className="text-xs text-green-600 mt-2">
                과제가 제출되었습니다.
              </p>
            ) : currentTurn >= assignment.maxTurns ? (
              <p className="text-xs text-red-600 mt-2">
                최대 대화 턴에 도달했습니다.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
