
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, CheckCircle } from "lucide-react"

interface ChatInputAreaProps {
  input: string
  onInputChange: (value: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  isSubmitted: boolean
  currentTurn: number
  maxTurns: number
  canSubmit: boolean
  onShowSubmitForm: () => void
}

export function ChatInputArea({
  input,
  onInputChange,
  handleSubmit,
  isLoading,
  isSubmitted,
  currentTurn,
  maxTurns,
  canSubmit,
  onShowSubmitForm,
}: ChatInputAreaProps) {
  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      {!isSubmitted ? (
        <>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
            <Input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={
                currentTurn >= maxTurns
                  ? "최대 대화 턴에 도달했습니다."
                  : "환자에게 질문하거나 진료를 진행하세요..."
              }
              disabled={isLoading || currentTurn >= maxTurns}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || currentTurn >= maxTurns}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              대화 턴: {currentTurn}/{maxTurns}
            </div>

            {canSubmit && (
              <Button
                onClick={onShowSubmitForm}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                진찰결과 작성 및 제출
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">과제가 제출되었습니다</span>
          </div>
          <p className="text-sm text-gray-600">
            교수님의 채점을 기다려주세요.
          </p>
        </div>
      )}
    </div>
  )
}
