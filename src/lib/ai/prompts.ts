import type { TravelPace, TravelStyle, TransportPref } from "@/lib/supabase/database.types";

/**
 * Centralized prompt library.
 *
 * Every prompt is parametrized by the trip input. All instructions to the
 * model are in English (which models follow more reliably), but we
 * EXPLICITLY require the *content* (titles, descriptions, tips) to be
 * written in natural, premium Korean.
 */

export interface ItineraryPromptInput {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  budgetKrw: number;
  adults: number;
  children: number;
  childAges: number[];
  travelStyle: TravelStyle;
  transport: TransportPref;
  pace: TravelPace;
  notes?: string | null;
}

const STYLE_LABELS_KO: Record<TravelStyle, string> = {
  relaxed: "휴양 위주",
  sightseeing: "관광 위주",
  adventure: "액티비티",
  cultural: "문화/역사",
  foodie: "미식",
  shopping: "쇼핑",
  balanced: "균형 잡힌",
};

const TRANSPORT_LABELS_KO: Record<TransportPref, string> = {
  public: "대중교통",
  rental_car: "렌터카",
  taxi: "택시",
  walking: "도보 위주",
  mixed: "혼합",
};

const PACE_LABELS_KO: Record<TravelPace, string> = {
  slow: "여유롭게",
  moderate: "보통",
  packed: "알찬 일정",
};

export function buildItineraryPrompt(input: ItineraryPromptInput): {
  system: string;
  user: string;
} {
  const youngestAge = input.childAges.length ? Math.min(...input.childAges) : null;

  // Age-aware tips guidance. Stroller/nursing only matter for toddlers.
  const ageGuidance =
    youngestAge === null
      ? `- 아이가 없는 성인만의 여행입니다. 키즈 시설 언급 금지.`
      : youngestAge <= 3
        ? `- 막내가 ${youngestAge}세입니다. tips에 유모차 접근, 수유실, 기저귀 교환대, 키즈 메뉴 정보를 적극 포함하세요.
- 한 곳에 머무는 시간을 짧게(60-90분) 잡고, 오후에 호텔 복귀 또는 카페 휴식을 반드시 넣으세요.`
        : youngestAge <= 6
          ? `- 막내가 ${youngestAge}세입니다. tips에 키즈 메뉴, 화장실 위치, 줄 길이를 위주로 적으세요.
- 유모차 언급은 금지 (이 나이엔 보통 안 탑니다).
- 박물관/미술관은 1시간 이내 권장.`
          : youngestAge <= 9
            ? `- 아이가 ${input.childAges.map((a) => `${a}세`).join(", ")}입니다. **유모차/수유실 같은 영유아 정보는 절대 언급하지 마세요.**
- tips에는 "아이가 흥미를 가질 만한 포인트", "지루해할 수 있는 구간", "체험 가능 여부", "한국어 안내 유무" 같은 정보 위주로 작성하세요.
- 일반 식당(키즈 메뉴 없어도) 추천 가능. 단, 너무 격식 있는 파인 다이닝은 제외.`
            : `- 아이가 ${input.childAges.map((a) => `${a}세`).join(", ")}로 거의 청소년에 가깝습니다.
- 유모차/수유실/키즈 메뉴 언급 금지.
- tips에는 인스타 스폿, 액티비티 강도, 자유시간 여부 같은 정보를 적으세요.
- 박물관/액티비티 시간을 더 길게 잡아도 됩니다.`;

  const trimmedNotes = input.notes?.trim();
  const userRequestSection = trimmedNotes
    ? `

USER'S EXPLICIT REQUESTS (HIGHEST PRIORITY — override defaults):
The user wrote the following request. Treat it as a HARD constraint that takes
precedence over generic stylistic choices. Reflect it concretely in the actual
items (not just the summary). If it names a place, occasion, dietary need, or
must-do, build the relevant day around it.
"""
${trimmedNotes}
"""
If a request cannot be honored (e.g., place doesn't exist at the destination),
acknowledge it briefly in the day's "summary" and offer the closest alternative.`
    : "";

  const system = `You are an expert family travel planner specializing in trips for Korean families with children.
${userRequestSection}

OUTPUT REQUIREMENTS (strict):
- Respond with ONE valid JSON object only — no prose, no markdown fences.
- All user-facing text (title, description, location_name, tips, summary) MUST be in natural, premium Korean.
- Field keys remain in English exactly as in the schema below.
- Costs are integers in KRW (Korean Won).
- Times are 24h "HH:MM" strings.
- Each day has 4–7 items balancing meals, attractions, and rest.

DATE / TIME CONSISTENCY (CRITICAL — strictly follow):
- The "days" array MUST contain EXACTLY ${input.durationDays} entries — no more, no fewer.
- "day_index" MUST run 1, 2, 3, … up to ${input.durationDays} with no gaps, no duplicates, in order.
- Within each day, list items in CHRONOLOGICAL order by start_time (earliest first).
- Item time ranges within a day MUST NOT overlap, and end_time MUST be later than start_time.
- Leave realistic travel/rest gaps between items (don't schedule two places back-to-back with 0 minutes when they are apart).
- type="rest" / type="note" items may omit start_time/end_time if they are not time-bound.

PLACE ACCURACY (CRITICAL — avoid hallucination):
- Use ONLY real, well-known, currently-operating places that genuinely exist at the destination. Never invent place names.
- Prefer famous landmarks and established, well-reviewed restaurants over obscure spots you are not confident exist.
- If you are not certain of the exact street address, leave "address" as an EMPTY STRING "" rather than guessing. A wrong address is worse than none.
- "location_name" should be the commonly used name of the place (Korean or local name travelers actually search for).
- Do NOT fabricate phone numbers, specific opening hours, or exact prices you are unsure of — keep such details in "tips" with hedging (e.g., "방문 전 영업시간 확인 권장").

AGE-AWARE GUIDANCE (CRITICAL — strictly follow):
${ageGuidance}

COST ESTIMATION RULES (CRITICAL):
- For type="accommodation": SET estimated_cost_krw = 0. Mention typical price range in the "tips" field as Korean text (e.g., "1박 약 25-40만원 예상, 실제 가격은 부킹닷컴 등에서 확인 권장"). 호텔 가격은 시즌과 등급에 따라 매우 다양하므로 추정치를 정해 입력하지 마세요.
- For type="transport": realistic local prices. 도쿄 지하철 1회 ~2000원, 시드니 Opal 카드 1회 ~5000원, 택시는 거리에 따라.
- For type="restaurant": realistic per-person prices for the destination. 호주/유럽은 한 끼 1인 3-8만원이 일반적.
- For type="attraction": entrance fees only. 무료면 0.
- 의심스러우면 낮춰 적기보다 현지 평균 또는 약간 높게 적으세요.

CHILD_FRIENDLY flag:
- true if the youngest listed child can participate meaningfully
- false only for places truly unsuitable (e.g., bar, fine dining with dress code, extreme sports)

ROUTING / DAY GROUPING (CRITICAL):
- Within a single day, only include places in the **same area or along a logical route**.
  예) 시드니: "Day 2 = 시드니 CBD + Darling Harbour" 처럼 한 동네 묶기. CBD와 Bondi Beach를 같은 날 오전/오후로 쪼개지 마세요 (이동 1시간+).
- 한 도시 안에서도 차로 1시간 이상 떨어진 곳은 같은 날에 배치 금지.
- 도시 간 이동이 있으면 그 날은 이동 + 도착지 가벼운 관광만 (오전 이동 → 오후 1-2곳).

FIRST DAY / LAST DAY HANDLING (CRITICAL):
- Day 1 (도착일): 비행 도착 시간을 알 수 없으므로 **오후 도착 가정**. 호텔 체크인 → 호텔 근처 가벼운 산책 + 저녁 식사. 무리한 관광 금지. 보통 2-3 items.
- Last day (출국일): 비행 출발 시간을 모르더라도 **오전 ~ 이른 오후까지만** 일정. 마지막에 type="transport"로 "공항 이동 (출발 시간 3시간 전 도착 권장)" 명시. 2-4 items.
- Day 1과 마지막날은 다른 날보다 짧고 가벼워야 합니다.

GENRE BALANCE (CRITICAL):
- 전체 일정을 통틀어 다음 카테고리를 골고루 섞으세요:
  1) 자연/야외 (공원, 해변, 전망대, 산책로)
  2) 문화/역사 (박물관, 미술관, 유적지, 사원/성당)
  3) 체험/액티비티 (테마파크, 동물원·수족관, 체험학습, 액티비티)
  4) 도시 탐험 (랜드마크, 거리 산책, 쇼핑가, 야시장)
  5) 식도락 (현지 유명 식당, 시장, 카페)
- **같은 카테고리가 연속 2일 이상 메인이 되지 않게** 해주세요. 예: 박물관을 2일 연속 메인으로 잡으면 가족이 지칩니다.
- 매일 식사 type="restaurant"은 2~3끼 들어가는 것 정상. 위 카테고리 균형은 식사 외 활동 기준.
- 5일 이상 여행이면 **반나절 또는 하루 가벼운 쉬는 날**을 1번 넣으세요 (호텔 수영장, 카페 산책, 호텔 근처 공원 등).
- 식당은 매일 다른 종류로: 현지식·면류·캐주얼·한 끼 정도는 한국인 무난한 곳(중식/일식/패밀리 레스토랑 등) 포함.

JSON schema:
{
  "summary": string,
  "days": [
    {
      "day_index": number (1-based),
      "title": string,
      "summary": string,
      "items": [
        {
          "type": "attraction" | "restaurant" | "transport" | "accommodation" | "activity" | "rest" | "note",
          "title": string,
          "description": string,
          "location_name": string,
          "address": string,
          "start_time": "HH:MM",
          "end_time": "HH:MM",
          "estimated_cost_krw": number,
          "child_friendly": boolean,
          "tips": string
        }
      ]
    }
  ],
  "total_estimated_cost_krw": number,
  "transportation_recommendation": string
}`;

  const childAgesText =
    input.children > 0 && input.childAges.length > 0
      ? `, 아이 나이: ${input.childAges.map((a) => `${a}세`).join(", ")}`
      : "";

  const user = `다음 조건으로 ${input.durationDays}일 가족여행 일정을 짜주세요.

- 목적지: ${input.destination}
- 일정: ${input.startDate} ~ ${input.endDate} (총 ${input.durationDays}일)
- 인원: 성인 ${input.adults}명, 아이 ${input.children}명${childAgesText}
- 예산: ${input.budgetKrw.toLocaleString("ko-KR")}원
- 여행 스타일: ${STYLE_LABELS_KO[input.travelStyle]}
- 교통 선호: ${TRANSPORT_LABELS_KO[input.transport]}
- 페이스: ${PACE_LABELS_KO[input.pace]}
${input.notes ? `- 추가 요청사항: ${input.notes}` : ""}

특히 신경 써주세요:
1. **반드시 정확히 ${input.durationDays}일치 일정** (day_index 1~${input.durationDays}, 누락/중복 없이)을 만들고, 각 날의 항목은 시간순으로 정렬하며 시간대가 겹치지 않게 하세요.
2. **실제로 존재하는 유명한 장소만** 사용하고, 주소가 불확실하면 address는 빈 문자열로 두세요 (지어내지 마세요).
3. 아이가 있는 가족이므로 무리한 이동은 피하고, 오후 휴식 시간을 적절히 배치하며 화장실/수유실/유모차 접근 정보를 tips에 명시
4. 식당은 한국인 가족 입맛에도 무난한 곳 위주, 예산 안에서 합리적으로 분배
5. 첫날은 도착/체크인 고려, 마지막 날은 출국 고려${
    trimmedNotes
      ? `
6. **위 시스템 지시의 '추가 요청사항'을 최우선으로 반영** — 실제 항목에 구체적으로 녹여주세요.`
      : ""
  }`;

  return { system, user };
}

export interface PackingPromptInput {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  adults: number;
  children: number;
  childAges: number[];
  travelStyle: TravelStyle;
}

export function buildPackingPrompt(input: PackingPromptInput): {
  system: string;
  user: string;
} {
  const system = `You generate a smart packing checklist for a Korean family trip.

OUTPUT REQUIREMENTS:
- Respond with ONE valid JSON object only.
- Categories and item names MUST be in natural Korean.
- Group items into Korean categories like "필수서류", "의류", "세면용품", "전자기기", "아이용품", "비상약", "기타".
- Mark for_child=true for items specifically for the children.
- Quantity is realistic for the trip length and family size.

JSON schema:
{
  "items": [
    { "category": string, "name": string, "quantity": number, "for_child": boolean, "notes": string }
  ]
}`;

  const childAgesText =
    input.children > 0 && input.childAges.length > 0
      ? ` (아이 나이: ${input.childAges.map((a) => `${a}세`).join(", ")})`
      : "";

  const user = `다음 여행에 맞는 가족 짐 체크리스트를 만들어주세요.

- 목적지: ${input.destination}
- 기간: ${input.durationDays}일
- 인원: 성인 ${input.adults}명, 아이 ${input.children}명${childAgesText}
- 스타일: ${input.travelStyle}

목적지 기후/문화에 맞춰 빠뜨리기 쉬운 항목까지 포함해주세요. 아이용 약, 간식, 카시트, 유모차 등도 고려해주세요.`;

  return { system, user };
}
