export async function POST(req: Request) {
  try {
    const { messages, patientInfo } = await req.json()

    // 마지막 사용자 메시지 가져오기
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

    // 환자 정보에 따른 목업 응답 생성
    let response = ""

    // 간단한 키워드 기반 응답 로직
    if (lastUserMessage.includes("안녕") || lastUserMessage.includes("처음")) {
      response = `네, 안녕하세요. 저는 ${patientInfo.personaName}입니다. ${patientInfo.personaSymptom} 때문에 정말 힘들어요.`
    } else if (lastUserMessage.includes("언제") || lastUserMessage.includes("시작")) {
      response = "3일 전부터 시작됐어요. 처음에는 괜찮을 줄 알았는데 점점 심해지는 것 같아서 걱정이에요."
    } else if (lastUserMessage.includes("통증") || lastUserMessage.includes("아프")) {
      response = "네, 정말 아파요. 특히 움직일 때 더 심해지는 것 같아요. 밤에도 잠을 잘 못 잘 정도예요."
    } else if (lastUserMessage.includes("약") || lastUserMessage.includes("복용")) {
      response = "현재 고혈압 약을 복용하고 있어요. 그런데 가끔 깜빡하고 안 먹을 때도 있어요."
    } else if (lastUserMessage.includes("가족") || lastUserMessage.includes("병력")) {
      response = "가족 중에 비슷한 병을 앓은 사람이 있어요. 어머니가 당뇨병을 앓으셨거든요."
    } else if (lastUserMessage.includes("검사") || lastUserMessage.includes("진단")) {
      response = "네, 필요하다면 검사를 받겠어요. 정확히 뭐가 문제인지 알고 싶어요."
    } else if (lastUserMessage.includes("걱정") || lastUserMessage.includes("무서")) {
      response = "네, 정말 걱정이 많이 돼요. 혹시 큰 병은 아닐까요? 가족들도 걱정하고 있어요."
    } else if (lastUserMessage.includes("생활") || lastUserMessage.includes("습관")) {
      response = "평소에 운동은 별로 안 하고, 짠 음식을 좀 좋아해요. 스트레스도 많이 받는 편이에요."
    } else if (lastUserMessage.includes("치료") || lastUserMessage.includes("방법")) {
      response = "어떻게 치료해야 하나요? 수술이 필요한 건 아니죠? 일상생활에 지장이 없었으면 좋겠어요."
    } else if (lastUserMessage.includes("감사") || lastUserMessage.includes("고마")) {
      response = "선생님 덕분에 많이 안심이 되네요. 앞으로 더 건강 관리에 신경 쓰겠어요."
    } else {
      // 기본 응답들
      const defaultResponses = [
        "네, 그렇군요. 더 자세히 설명해 주실 수 있나요?",
        "음... 그런 것 같기도 해요. 어떻게 해야 할까요?",
        "선생님 말씀을 들으니 조금 이해가 되네요.",
        "네, 알겠습니다. 다른 것도 확인해 보시겠어요?",
        "그런 증상도 있는 것 같아요. 정말 걱정이에요.",
        "선생님이 설명해 주시니까 조금 안심이 되네요.",
        "네, 앞으로 그렇게 해보겠어요. 다른 주의사항도 있나요?",
      ]
      response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
    }

    // 응답 지연 시뮬레이션 (실제 API 호출처럼 보이게)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    return Response.json({ content: response })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}