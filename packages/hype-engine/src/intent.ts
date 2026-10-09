import type { IntentLabel } from "./types"

const RULES: Array<{ intent: IntentLabel; patterns: RegExp[] }> = [
  { intent: "CANCELLING", patterns: [/cancel/, /not going/, /postponed/, /calling it off/] },
  { intent: "COMPLAINING_ABOUT_CROWD", patterns: [/too crowded/, /nightmare/, /overcrowded/, /regret/, /packed like/] },
  { intent: "ASKING_CROWD", patterns: [/how crowded/, /is it crowded/, /crowd/, /rush/] },
  { intent: "ASKING_WEATHER", patterns: [/weather/, /snowfall/, /snow/, /rain/] },
  { intent: "ASKING_ROUTE", patterns: [/how to reach/, /delhi to/, /this saturday\?/, /bus to/, /drive to/, /route/] },
  { intent: "BOOKING", patterns: [/best hotels/, /hotel/, /homestay/, /book a/, /booking/] },
  { intent: "PLANNING_TRIP", patterns: [/going to/, /planning/, /this weekend/, /trip to/, /long weekend/] },
  { intent: "RECENTLY_VISITED", patterns: [/just got back/, /visited/, /was in /, /returned from/] },
  { intent: "RECOMMENDING", patterns: [/must visit/, /loved/, /hidden gem/, /you should go/] },
  { intent: "RESEARCHING", patterns: [/best time/, /itinerary/, /guide/, /places near/] },
]

export const INTENT_WEIGHT: Record<IntentLabel, number> = {
  PLANNING_TRIP: 3,
  BOOKING: 2.5,
  ASKING_CROWD: 1.2,
  RESEARCHING: 1,
  ASKING_ROUTE: 0.8,
  ASKING_WEATHER: 0.7,
  RECOMMENDING: 0.6,
  RECENTLY_VISITED: 0.15,
  COMPLAINING_ABOUT_CROWD: -0.4,
  CANCELLING: -1.5,
}

export function classifyIntent(text: string): IntentLabel {
  const normalized = text.toLowerCase()
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) return rule.intent
  }
  return "RESEARCHING"
}

export function intentScore(counts: Partial<Record<IntentLabel, number>>): number {
  let score = 0
  for (const [intent, count] of Object.entries(counts) as Array<[IntentLabel, number]>) {
    score += (INTENT_WEIGHT[intent] ?? 0) * count
  }
  return score
}
