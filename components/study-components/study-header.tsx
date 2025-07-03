"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle } from "lucide-react"
import type { StudentAssignmentDetailResponseDto, GenderType } from "@/types/assignment"

interface StudyHeaderProps {
  assignment: StudentAssignmentDetailResponseDto
  isSubmitted: boolean
  courseId: string
}

const getGenderText = (gender: GenderType) => {
  return gender === "MALE" ? "남성" : "여성"
}

export function StudyHeader({ assignment, isSubmitted, courseId }: StudyHeaderProps) {
  return (
    <div className="border-b border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            {assignment.title}
          </h1>
          <p className="text-sm text-gray-600">
            환자: {assignment.personaName} ({assignment.personaAge}세,{" "}
            {getGenderText(assignment.personaGender)})
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSubmitted && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              제출 완료
            </Badge>
          )}
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              과제 목록으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
