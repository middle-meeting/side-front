"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { GraduationCap, Loader2 } from "lucide-react"

import type {
  ChatMessage as ChatMessageType,
  DiagnosisSubmission,
  StudentAssignmentDetailResponseDto,
  GenderType,
} from "@/types/assignment"

import { PatientInfoSidebar } from "@/components/study-components/patient-info-sidebar"
import { StudyHeader } from "@/components/study-components/study-header"
import { ChatMessage } from "@/components/study-components/chat-message"
import { ChatInputArea } from "@/components/study-components/chat-input-area"
import { DiagnosisFormModal } from "@/components/study-components/diagnosis-form-modal"
import { Button } from "@/components/ui/button"

export default function StudyPage() {
  const params = useParams<{ id: string, assignmentId: string }>()
  const courseId = params.id
  const assignmentId = params.assignmentId

  const [assignment, setAssignment] =
    useState<StudentAssignmentDetailResponseDto | null>(null)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!courseId || !assignmentId) {
        setError("Course ID or Assignment ID is missing.")
        return
      }
      try {
        const response = await fetch(
          `/api/student/courses/${courseId}/assignments/${assignmentId}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch assignment data")
        }
        const result = await response.json()
        if (result.status === "OK") {
          setAssignment(result.data)
        } else {
          throw new Error(result.message || "Failed to fetch assignment data")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      }
    }

    fetchAssignment()
  }, [courseId, assignmentId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (assignment) {
      const initialMessage: ChatMessageType = {
        id: "1",
        role: "assistant",
        content: `안녕하세요, 저는 ${assignment.personaName}입니다. ${assignment.personaSymptom} 때문에 병원에 왔어요. 많이 아파서 걱정이 되네요...`,
        timestamp: new Date(),
      }
      setMessages([initialMessage])
    }
  }, [assignment])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !input.trim() ||
      isLoading ||
      currentTurn >= assignment.maxTurns ||
      isSubmitted
    )
      return

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setCurrentTurn((prev) => prev + 1)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          patientInfo: assignment,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAssignment = async (submission: DiagnosisSubmission) => {
    try {
      console.log("제출된 진찰결과:", submission)

      setIsSubmitted(true)
      setShowSubmitForm(false)

      const submitMessage: ChatMessageType = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          "과제와 진찰결과가 성공적으로 제출되었습니다. 교수님의 채점을 기다려주세요.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, submitMessage])
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const canSubmit = currentTurn > 0 && !isSubmitted

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                의료교육 플랫폼
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">강의 목록</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="text-blue-600">
                  환자 시뮬레이션
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)] bg-white">
        {assignment ? (
          <>
            <div className="flex-1 flex flex-col">
              <StudyHeader assignment={assignment} isSubmitted={isSubmitted} courseId={courseId} />

              <div className="flex-1 overflow-y-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    personaName={assignment.personaName}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3 p-4 bg-gray-50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {assignment.personaName}
                      </div>
                      <div className="text-sm text-gray-600">입력 중...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <ChatInputArea
                input={input}
                onInputChange={setInput}
                handleSubmit={handleSendMessage}
                isLoading={isLoading}
                isSubmitted={isSubmitted}
                currentTurn={currentTurn}
                maxTurns={assignment.maxTurns}
                canSubmit={canSubmit}
                onShowSubmitForm={() => setShowSubmitForm(true)}
              />
            </div>

            <PatientInfoSidebar
              assignment={assignment}
              currentTurn={currentTurn}
              isSubmitted={isSubmitted}
            />
          </>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      <DiagnosisFormModal
        isOpen={showSubmitForm}
        onClose={() => setShowSubmitForm(false)}
        onSubmit={handleSubmitAssignment}
      />
    </div>
  )
}