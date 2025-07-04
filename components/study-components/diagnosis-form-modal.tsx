"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Plus, Trash2, CheckCircle } from "lucide-react"
import type {
  DiagnosisSubmission,
  Prescription,
} from "@/types/assignment"

interface DiagnosisFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DiagnosisSubmission) => void
}

const initialFormState: DiagnosisSubmission = {
  primaryDiagnosis: "",
  subDiagnosis: "",
  prescriptions: [{ id: "1", drugName: "", dosage: "", frequency: "", duration: "" }],
  finalJudgment: "",
}

export function DiagnosisFormModal({
  isOpen,
  onClose,
  onSubmit,
}: DiagnosisFormModalProps) {
  const [diagnosisForm, setDiagnosisForm] = useState<DiagnosisSubmission>(initialFormState)

  const addPrescription = () => {
    const newPrescription: Prescription = {
      id: Date.now().toString(),
      drugName: "",
      dosage: "",
      frequency: "",
      duration: "",
    }
    setDiagnosisForm((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, newPrescription],
    }))
  }

  const removePrescription = (id: string) => {
    setDiagnosisForm((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((p) => p.id !== id),
    }))
  }

  const updatePrescription = (
    id: string,
    field: keyof Omit<Prescription, "id">,
    value: string
  ) => {
    setDiagnosisForm((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }))
  }

  const handleFormSubmit = () => {
    if (isFormValid()) {
      onSubmit(diagnosisForm)
      onClose()
    }
  }

  const isFormValid = () => {
    return (
      diagnosisForm.primaryDiagnosis.trim() !== "" &&
      diagnosisForm.finalJudgment.trim() !== "" &&
      diagnosisForm.prescriptions.some((p) => p.drugName.trim() !== "")
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              진찰결과 및 처방 작성
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            환자와의 대화를 바탕으로 진단과 치료 계획을 작성해주세요.
          </p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 진단 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">진단</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-diagnosis">주 진단 *</Label>
                <Input
                  id="primary-diagnosis"
                  value={diagnosisForm.primaryDiagnosis}
                  onChange={(e) =>
                    setDiagnosisForm((prev) => ({
                      ...prev,
                      primaryDiagnosis: e.target.value,
                    }))
                  }
                  placeholder="예: 급성 충수염 (K35.9)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sub-diagnosis">부 진단</Label>
                <Input
                  id="sub-diagnosis"
                  value={diagnosisForm.subDiagnosis}
                  onChange={(e) =>
                    setDiagnosisForm((prev) => ({
                      ...prev,
                      subDiagnosis: e.target.value,
                    }))
                  }
                  placeholder="예: 고혈압 (I10)"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* 처방 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">처방</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrescription}
              >
                <Plus className="w-4 h-4 mr-1" />
                처방 추가
              </Button>
            </div>

            {diagnosisForm.prescriptions.map((prescription, index) => (
              <div
                key={prescription.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">처방 {index + 1}</h4>
                  {diagnosisForm.prescriptions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrescription(prescription.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor={`drugName-${prescription.id}`}>약물명</Label>
                    <Input
                      id={`drugName-${prescription.id}`}
                      value={prescription.drugName}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "drugName",
                          e.target.value
                        )
                      }
                      placeholder="예: 아목시실린"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`dosage-${prescription.id}`}>용량</Label>
                    <Input
                      id={`dosage-${prescription.id}`}
                      value={prescription.dosage}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "dosage",
                          e.target.value
                        )
                      }
                      placeholder="예: 500mg"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`frequency-${prescription.id}`}>복용법</Label>
                    <Input
                      id={`frequency-${prescription.id}`}
                      value={prescription.frequency}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "frequency",
                          e.target.value
                        )
                      }
                      placeholder="예: 1일 3회"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`duration-${prescription.id}`}>복용기간</Label>
                    <Input
                      id={`duration-${prescription.id}`}
                      value={prescription.duration}
                      onChange={(e) =>
                        updatePrescription(
                          prescription.id,
                          "duration",
                          e.target.value
                        )
                      }
                      placeholder="예: 7일간"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 임상적 근거 */}
          <div>
            <Label htmlFor="final-judgment">
              임상적 근거 및 판단 과정 *
            </Label>
            <Textarea
              id="final-judgment"
              value={diagnosisForm.finalJudgment}
              onChange={(e) =>
                setDiagnosisForm((prev) => ({
                  ...prev,
                  finalJudgment: e.target.value,
                }))
              }
              placeholder="진단에 이른 임상적 근거와 판단 과정을 상세히 설명해주세요."
              className="mt-1"
              rows={4}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              * 표시된 항목은 필수 입력 사항입니다.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button onClick={handleFormSubmit} disabled={!isFormValid()}>
                <CheckCircle className="w-4 h-4 mr-2" />
                과제 제출
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
