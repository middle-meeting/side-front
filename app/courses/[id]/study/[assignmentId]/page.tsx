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
  ChatResponseData,
} from "@/types/assignment"

interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
  error: any;
}

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
  const [loadingChat, setLoadingChat] = useState(true)
  const [chatError, setChatError] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAssignmentAndChat = async () => {
      if (!courseId || !assignmentId) {
        setError("Course ID or Assignment ID is missing.")
        return
      }

      try {
        // Fetch assignment details
        const assignmentResponse = await fetch(
          `/api/student/courses/${courseId}/assignments/${assignmentId}`
        )
        if (!assignmentResponse.ok) {
          throw new Error("Failed to fetch assignment data")
        }
        const assignmentResult = await assignmentResponse.json()
        if (assignmentResult.status === "OK") {
          setAssignment(assignmentResult.data)
        } else {
          throw new Error(assignmentResult.message || "Failed to fetch assignment data")
        }

        // Fetch chat messages
        const chatResponse = await fetch(
          `/api/student/assignments/${assignmentId}/chat/messages`
        )
        if (!chatResponse.ok) {
          throw new Error("Failed to fetch chat messages")
        }
        const chatResult = await chatResponse.json()
        let fetchedMessages: ChatMessageType[] = []; // fetchedMessages 선언
        if (chatResult.status === "OK") {
          fetchedMessages = chatResult.data; // 값 할당
          setMessages(fetchedMessages);
          // 학생 메시지의 수만 턴으로 계산
          const studentMessagesCount = fetchedMessages.filter(msg => msg.speaker === "STUDENT").length;
          setCurrentTurn(studentMessagesCount);
        } else {
          // 채팅 기록이 없는 경우 오류로 처리하지 않음
          if (chatResult.code === 404) { // 예시: 백엔드에서 404 코드를 반환하는 경우
            setMessages([]);
            setCurrentTurn(0);
          } else {
            setChatError(chatResult.message || "Failed to fetch chat messages");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoadingChat(false)
      }
    }

    fetchAssignmentAndChat()
  }, [courseId, assignmentId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      id: Date.now(),
      turnNumber: currentTurn + 1,
      speaker: "STUDENT",
      message: input,
      timestamp: new Date().toISOString(),
    }

    // 사용자 메시지를 즉시 렌더링
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // AI 응답을 위한 임시 로딩 메시지 추가
    const loadingAiMessage: ChatMessageType = {
      id: Date.now() + 1, // 고유한 ID 부여
      turnNumber: currentTurn + 2,
      speaker: "AI",
      message: "", // 빈 메시지로 로딩 상태 표시
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, loadingAiMessage])

    try {
      const response = await fetch(`/api/student/assignments/${assignmentId}/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data: ApiResponse<ChatResponseData> = await response.json()

      if (data.status === "OK" && data.data) {
        const { studentMessage, aiMessage } = data.data;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingAiMessage.id ? aiMessage : msg
          )
        )
        setCurrentTurn(studentMessage.turnNumber) // 학생 메시지의 턴 번호로 업데이트
      } else {
        throw new Error(data.message || "Failed to get response")
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: ChatMessageType = {
        id: loadingAiMessage.id,
        turnNumber: loadingAiMessage.turnNumber,
        speaker: "AI",
        message: "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingAiMessage.id ? errorMessage : msg
        )
      )
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (loadingChat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">채팅 기록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

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
                {messages.length === 0 && !loadingChat && !chatError ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <GraduationCap className="w-16 h-16 mb-4" />
                    <p className="text-lg font-semibold mb-2">아직 시작하지 않은 과제입니다.</p>
                    <p>아래 입력창에 메시지를 입력하여 과제를 시작하세요.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      personaName={assignment.personaName}
                    />
                  ))
                )}
                {/* isLoading에 따른 로딩 인디케이터는 ChatMessage 컴포넌트 내부에서 처리 */}
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