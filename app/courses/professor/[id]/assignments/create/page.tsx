"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, User, Target, FileText } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { AssignmentCreateDto, GenderType } from "@/types/assignmentProfessor"

export default function CreateAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const courseId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<AssignmentCreateDto>({
    title: "",
    personaName: "",
    personaAge: 30,
    personaGender: "MALE" as GenderType,
    personaSymptom: "",
    personaHistory: "",
    personaPersonality: "",
    personaDisease: "",
    objective: "",
    maxTurns: 10,
    dueDate: "",
  })

  const handleInputChange = (field: keyof AssignmentCreateDto, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/professor/courses/${courseId}/assignments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include"
      })
      console.log("Response:", response)
      const result = await response.json()

      if (response.ok) {
        toast({
          title: "과제 생성 완료",
          description: "새로운 과제가 성공적으로 생성되었습니다.",
        })
        router.push(`/courses/professor/${courseId}`)
      } else {
        toast({
          title: "과제 생성 실패",
          description: result.error || "과제 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "과제 생성 실패",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 오늘 날짜를 YYYY-MM-DDTHH:MM 형식으로 변환
  const getTomorrowDateTime = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59)
    return tomorrow.toISOString().slice(0, 16)
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
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">새 과제 생성</h1>
                <p className="text-sm text-gray-600">환자 케이스 과제 만들기</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name} 교수</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 과제 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                과제 기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">과제 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="예: 급성 심근경색 환자 진단"
                  required
                />
              </div>

              <div>
                <Label htmlFor="objective">과제 목표 *</Label>
                <Textarea
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => handleInputChange("objective", e.target.value)}
                  placeholder="이 과제를 통해 학생들이 달성해야 할 학습 목표를 작성해주세요."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxTurns">최대 대화 턴 수 *</Label>
                  <Input
                    id="maxTurns"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxTurns}
                    onChange={(e) => handleInputChange("maxTurns", Number.parseInt(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">마감일 *</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    min={getTomorrowDateTime()}
                    required
                  />
                </div>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="personaName">환자 이름 *</Label>
                  <Input
                    id="personaName"
                    value={formData.personaName}
                    onChange={(e) => handleInputChange("personaName", e.target.value)}
                    placeholder="예: 김철수"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="personaAge">나이 *</Label>
                  <Input
                    id="personaAge"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.personaAge}
                    onChange={(e) => handleInputChange("personaAge", Number.parseInt(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="personaGender">성별 *</Label>
                  <Select
                    value={formData.personaGender}
                    onValueChange={(value) => handleInputChange("personaGender", value as GenderType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">남성</SelectItem>
                      <SelectItem value="FEMALE">여성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="personaSymptom">주요 증상 *</Label>
                <Textarea
                  id="personaSymptom"
                  value={formData.personaSymptom}
                  onChange={(e) => handleInputChange("personaSymptom", e.target.value)}
                  placeholder="환자가 호소하는 주요 증상을 상세히 작성해주세요."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="personaHistory">병력 *</Label>
                <Textarea
                  id="personaHistory"
                  value={formData.personaHistory}
                  onChange={(e) => handleInputChange("personaHistory", e.target.value)}
                  placeholder="과거 병력, 가족력, 사회력 등을 포함한 환자의 병력을 작성해주세요."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="personaPersonality">환자 성격/특성 *</Label>
                <Textarea
                  id="personaPersonality"
                  value={formData.personaPersonality}
                  onChange={(e) => handleInputChange("personaPersonality", e.target.value)}
                  placeholder="환자의 성격, 말투, 행동 특성 등을 작성해주세요. 이는 AI가 환자 역할을 할 때 참고됩니다."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="personaDisease">진단명/질병 정보 *</Label>
                <Textarea
                  id="personaDisease"
                  value={formData.personaDisease}
                  onChange={(e) => handleInputChange("personaDisease", e.target.value)}
                  placeholder="실제 진단명과 질병에 대한 상세 정보를 작성해주세요. (학생에게는 공개되지 않습니다)"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <Link href={`/courses/professor/${courseId}`}>
              <Button type="button" variant="outline">
                취소
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  생성 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  과제 생성
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
