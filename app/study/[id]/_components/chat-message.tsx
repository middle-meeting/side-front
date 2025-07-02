
"use client"

import { Bot, User } from "lucide-react"
import type { ChatMessage as ChatMessageType } from "@/types/assignment"

interface ChatMessageProps {
  message: ChatMessageType
  personaName: string
}

export function ChatMessage({ message, personaName }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      key={message.id}
      className={`flex gap-3 p-4 ${isUser ? "bg-white" : "bg-gray-50"}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isUser ? "학생" : personaName}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="text-sm text-gray-800 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  )
}
